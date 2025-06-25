import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import supabase from '../supabaseClient';

import '../shared/Header.css';

import '../shared/normalize.css';

import DarkModeToggle from '../shared/DarkModeToggle.tsx';

import { CheckCircle, XCircle, Loader2, User, FileText, ArrowLeft, Trash2, KeyRound } from 'lucide-react';

import AdminPassVer from './Admin_Pass_Ver.tsx';



const Header = () => {

    const navigate = useNavigate();



    const handleSignOut = async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {

            console.error('Error signing out:', error.message);

        } else {

            navigate('/customer-landing');

        }

    };



    const handleBack = () => {

        navigate("/admin-dashboard");

    };



    return (

        <header className="header">

            <div className="header__content">

                <button onClick={handleBack} className="back-button">

                    <ArrowLeft size={24} />

                    <span className="back-button-text">Back</span>

                </button>

                <h1 className="header__title">Eminent Western</h1>

                <nav className="header-nav">

                </nav>

                <div className="header-actions">

                    <DarkModeToggle />

                    <button onClick={handleSignOut} className="sign-out-button">

                        Sign Out

                    </button>

                </div>

            </div>

        </header>

    );

};



// Interface for account type based on your Supabase schema

type AccountType = 'Savings' | 'Checking' | 'Loan' | string;

type AccountStatus = 'Pending' | 'Active' | 'Inactive' | 'Rejected' | string;



// Interface for Account details

interface Account {

    account_id: string;

    customer_id: string;

    account_no: string;

    account_type: AccountType;

    balance: number;

    account_status: AccountStatus;

    created_at: string;

    nickname: string | null;

    approved_at: string | null;

    favourite_accounts: any[] | null; // Adjust type if you have a specific structure for this column

}



// Interface for Customer details (extended to include Account relationship)

interface CustomerDetails {

    customer_id: string;

    first_name: string;

    last_name: string;

    phone_no: string;

    username: string; // Assuming this is the email

    created_at: string;

    Account: Account[]; // Customer can have multiple accounts

}



const CustomerDetailsPage: React.FC = () => {

    const { customerId } = useParams<{ customerId: string }>();

    const navigate = useNavigate();



    // State for customer data and UI feedback

    const [customer, setCustomer] = useState<CustomerDetails | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [isUpdating, setIsUpdating] = useState(false);

    const [updateMessage, setUpdateMessage] = useState<string | null>(null);



    // State for password verification modal

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [passwordModalError, setPasswordModalError] = useState<string | null>(null);

    const [passwordModalLoading, setPasswordModalLoading] = useState(false);

    // State to temporarily store account details for deletion after verification

    const [accountToDelete, setAccountToDelete] = useState<{ accountId: string; accountNo: string } | null>(null);





    // useEffect hook to fetch customer and account details when the component mounts or customerId changes

    useEffect(() => {

        const fetchCustomerDetails = async () => {

            setLoading(true);

            setError(null); // Clear previous errors

            setCustomer(null); // Clear previous customer data



            if (!customerId) {

                setError("Customer ID is missing from the URL.");

                setLoading(false);

                return;

            }



            try {

                // Fetch customer and their linked accounts using a join

                const { data, error: fetchError } = await supabase

                    .from('Customer')

                    .select(`

                        customer_id,

                        first_name,

                        last_name,

                        phone_no,

                        username,

                        created_at,

                        Account (

                            account_id,

                            account_no,

                            account_type,

                            balance,

                            account_status,

                            created_at,

                            nickname,

                            approved_at,

                            favourite_accounts

                        )

                    `)

                    .eq('customer_id', customerId)

                    .single(); // Use .single() as we expect one unique customer



                if (fetchError) {

                    throw fetchError;

                }



                if (data) {

                    setCustomer(data as CustomerDetails);

                } else {

                    // This case should ideally be caught by .single() throwing an error

                    // if no rows are found, but it's good for explicit handling.

                    setError("Customer not found with the provided ID.");

                }

            } catch (err: any) {

                console.error("Error fetching customer details:", err.message);

                setError(`Failed to load customer details: ${err.message}`);

            } finally {

                setLoading(false);

            }

        };



        fetchCustomerDetails();

    }, [customerId]); // Dependency array: re-run when customerId changes



    // Function to handle updating an account's status

    const handleAccountStatusUpdate = async (accountId: string, newStatus: AccountStatus) => {

        setIsUpdating(true);

        setUpdateMessage(null); // Clear previous update messages



        try {

            const { data, error: updateError } = await supabase

                .from('Account')

                .update({

                    account_status: newStatus,

                    // Set approved_at to current ISO string if status becomes 'Active', otherwise null

                    approved_at: newStatus === 'Active' ? new Date().toISOString() : null,

                })

                .eq('account_id', accountId)

                .select(); // Select the updated row to get its latest data



            if (updateError) {

                throw updateError;

            }



            if (data && data.length > 0) {

                setUpdateMessage(`Account ${data[0].account_no} status updated to ${newStatus}.`);

                // Optimistically update the UI state

                setCustomer(prevCustomer => {

                    if (!prevCustomer) return null; // Should not happen if 'customer' is already loaded

                    return {

                        ...prevCustomer,

                        Account: prevCustomer.Account.map(acc =>

                            acc.account_id === accountId

                                ? {

                                    ...acc,

                                    account_status: newStatus,

                                    approved_at: newStatus === 'Active' ? new Date().toISOString() : null

                                }

                                : acc

                        ),

                    };

                });

            } else {

                setUpdateMessage("No account found to update or no changes were made.");

            }

        } catch (err: any) {

            console.error("Error updating account status:", err.message);

            setUpdateMessage(`Failed to update account status: ${err.message}`);

        } finally {

            setIsUpdating(false);

            // Clear the update message after 3 seconds for transient feedback

            setTimeout(() => setUpdateMessage(null), 3000);

        }

    };



    // Function to initiate account deletion (shows the password modal)

    const initiateAccountDeletion = (accountId: string, accountNo: string) => {

        setAccountToDelete({ accountId, accountNo }); // Store account details temporarily

        setPasswordModalError(null); // Clear any previous modal errors

        setShowPasswordModal(true); // Open the password verification modal

    };



    /**

     * handlePasswordVerification: Verifies the entered password against the currently logged-in admin user's credentials.

     * This is done by attempting a 'silent' re-authentication using supabase.auth.signInWithPassword.

     * If the email and password match the active session, the call succeeds.

     * @param enteredPassword The password entered by the admin in the verification modal.

     */

    const handlePasswordVerification = async (enteredPassword: string) => {

        setPasswordModalLoading(true);

        setPasswordModalError(null);



        // Get the current logged-in user's email to attempt re-authentication

        const { data: { user }, error: userError } = await supabase.auth.getUser();



        if (userError || !user || !user.email) {

            setPasswordModalError('Could not retrieve current admin user information. Please log in again.');

            setPasswordModalLoading(false);

            return;

        }



        let isPasswordCorrectlyVerified: boolean = false;



        try {

            // Attempt to re-authenticate the current user with the provided password.

            // If this succeeds, it means the entered password is correct for the current user.

            const { error: signInError } = await supabase.auth.signInWithPassword({

                email: user.email,

                password: enteredPassword,

            });



            if (signInError) {

                // If there's a sign-in error, it typically means the password was incorrect.

                // Supabase error messages (e.g., "Invalid login credentials") can be displayed.

                setPasswordModalError(signInError.message || 'Incorrect admin password. Please try again.');

                isPasswordCorrectlyVerified = false;

            } else {

                // If no error, sign-in was successful, meaning the password is correct for the current user.

                isPasswordCorrectlyVerified = true;

            }

        } catch (err: any) {

            console.error("Error during password verification:", err.message);

            setPasswordModalError(`Verification failed: ${err.message}`);

            isPasswordCorrectlyVerified = false;

        } finally {

            setPasswordModalLoading(false);

        }



        // Proceed with deletion only if password was successfully verified

        if (isPasswordCorrectlyVerified) {

            if (accountToDelete) {

                await performAccountDeletion(accountToDelete.accountId, accountToDelete.accountNo);

            }

            setShowPasswordModal(false); // Close modal on success

            setAccountToDelete(null); // Clear stored account details

        }

        // If password was incorrect, the error message is already set in the modal, and it remains open.

    };



    // Actual account deletion logic (separated from modal trigger)

    const performAccountDeletion = async (accountId: string, accountNo: string) => {

        setIsUpdating(true); // Indicate overall update/delete operation is in progress

        setUpdateMessage(null);



        try {

            const { error: deleteError } = await supabase

                .from('Account')

                .delete()

                .eq('account_id', accountId);



            if (deleteError) {

                throw deleteError;

            }



            setUpdateMessage(`Account ${accountNo} successfully deleted.`);

            // Optimistically update the UI by removing the deleted account from the state

            setCustomer(prevCustomer => {

                if (!prevCustomer) return null;

                return {

                    ...prevCustomer,

                    Account: prevCustomer.Account.filter(acc => acc.account_id !== accountId),

                };

            });

        } catch (err: any) {

            console.error("Error deleting account:", err.message);

            setUpdateMessage(`Failed to delete account ${accountNo}: ${err.message}`);

        } finally {

            setIsUpdating(false);

            setTimeout(() => setUpdateMessage(null), 3000);

        }

    };



    // Helper function to determine the CSS class for status badges

    const getStatusClass = (status: string | boolean | null) => {

        if (typeof status === "boolean") {

            return status ? "badge-success" : "badge-error";

        }

        switch (status?.toLowerCase()) {

            case "active":

            case "approved":

                return "badge-success";

            case "pending":

            case "under review":

            case "null": // For cases where status might be explicitly null or undefined

                return "badge-warning";

            case "inactive":

            case "rejected":

            case "failed":

                return "badge-error";

            default:

                return "badge-default"; // A neutral badge for unknown statuses

        }

    };



    // Conditional rendering based on loading, error, and data availability

    if (loading) {

        return (

            <div className="admin-container">

                <Header />

                <main className="main-content flex items-center justify-center min-h-[calc(100vh-4rem)]">

                    <Loader2 className="animate-spin text-primary" size={32} />

                    <p className="ml-2 text-text">Loading customer details...</p>

                </main>

            </div>

        );

    }



    if (error) {

        return (

            <div className="admin-container">

                <Header />

                <main className="main-content">

                    <div className="card p-6 text-center">

                        <h2 className="text-xl font-semibold text-error-dark-text">Error</h2>

                        <p className="text-text-secondary mt-2">{error}</p>

                        <button onClick={() => navigate('/admin-dashboard')} className="btn btn-primary mt-4">

                            Go back to Dashboard

                        </button>

                    </div>

                </main>

            </div>

        );

    }



    if (!customer) {

        return (

            <div className="admin-container">

                <Header />

                <main className="main-content">

                    <div className="card p-6 text-center">

                        <h2 className="text-xl font-semibold text-text">Customer Not Found</h2>

                        <p className="text-text-secondary mt-2">The customer with ID "{customerId}" could not be found.</p>

                        <button onClick={() => navigate('/admin-dashboard')} className="btn btn-primary mt-4">

                            Go back to Dashboard

                        </button>

                    </div>

                </main>

            </div>

        );

    }



    // Main render for customer details and accounts

    return (

        <div className="admin-container">

            <Header />

            <main className="main-content">

                <div className="relative flex items-center justify-center mb-6">

                    <button

                        onClick={() => navigate('/admin-dashboard')}

                        className="absolute left-0 flex items-center text-primary-dark hover:text-primary-light transition-colors duration-200"

                        title="Back to Dashboard"

                    >

                        <ArrowLeft className="mr-2" size={20} />

                        Back

                    </button>

                    <h2 className="text-2xl font-bold text-text text-center flex-grow">Customer Details</h2>

                </div>



                {/* Display update success/error messages */}

                {updateMessage && (

                    <div className={`p-3 rounded-md mb-4 flex items-center justify-between ${updateMessage.includes('Failed') ? 'bg-error-light-bg text-error-dark-text' : 'bg-success-light-bg text-success-dark-text'}`}>

                        {updateMessage}

                        <button onClick={() => setUpdateMessage(null)} className="ml-4 text-sm font-semibold">

                            X

                        </button>

                    </div>

                )}



                <div className="grid grid-cols-1 gap-6"> {/* Updated: Removed md:grid-cols-2 */}

                    {/* Customer Information Card */}

                    <div className="card">

                        <div className="card-header">

                            <h3 className="card-title flex items-center">

                                <User className="mr-2" size={20} /> Customer Information

                            </h3>

                        </div>

                        <div className="card-content grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>

                                <p className="text-sm font-medium text-text-secondary">Customer ID</p>

                                <p className="text-text font-semibold">{customer.customer_id}</p>

                            </div>

                            <div>

                                <p className="text-sm font-medium text-text-secondary">Name</p>

                                <p className="text-text font-semibold">{customer.first_name} {customer.last_name}</p>

                            </div>

                            <div>

                                <p className="text-sm font-medium text-text-secondary">Email/Username</p>

                                <p className="text-text font-semibold">{customer.username}</p>

                            </div>

                            <div>

                                <p className="text-sm font-medium text-text-secondary">Phone Number</p>

                                <p className="text-text font-semibold">{customer.phone_no}</p>

                            </div>

                            <div>

                                <p className="text-sm font-medium text-text-secondary">Member Since</p>

                                <p className="text-text font-semibold">{new Date(customer.created_at).toLocaleDateString()}</p>

                            </div>

                        </div>

                    </div>



                    {/* Account Details Card (spans full width on larger screens for better table display) */}

                    <div className="card col-span-1 md:col-span-2">

                        <div className="card-header">

                            <h3 className="card-title flex items-center">

                                <FileText className="mr-2" size={20} /> Linked Accounts

                            </h3>

                        </div>

                        <div className="card-content">

                            {customer.Account && customer.Account.length > 0 ? (

                                <div className="table-container">

                                    <table className="table">

                                        <thead className="table-header">

                                            <tr>

                                                <th className="table-head">Account No.</th>

                                                <th className="table-head">Type</th>

                                                <th className="table-head">Balance</th>

                                                <th className="table-head">Nickname</th>

                                                <th className="table-head">Status</th>

                                                <th className="table-head">Created On</th>

                                                <th className="table-head">Approved On</th>

                                                <th className="table-head">Actions</th>

                                            </tr>

                                        </thead>

                                        <tbody className="table-body">

                                            {customer.Account.map((account) => (

                                                <tr key={account.account_id} className="table-row">

                                                    <td className="table-cell table-cell-bold">{account.account_no}</td>

                                                    <td className="table-cell">{account.account_type}</td>

                                                    <td className="table-cell table-cell-bold">${account.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>

                                                    <td className="table-cell">{account.nickname || 'N/A'}</td>

                                                    <td className="table-cell">

                                                        <span className={`badge ${getStatusClass(account.account_status)}`}>

                                                            {account.account_status}

                                                        </span>

                                                    </td>

                                                    <td className="table-cell">

                                                        {new Date(account.created_at).toLocaleDateString()}

                                                    </td>

                                                    <td className="table-cell">

                                                        {account.approved_at ? new Date(account.approved_at).toLocaleDateString() : 'N/A'}

                                                    </td>

                                                    <td className="table-cell">

                                                        <div className="flex gap-2">

                                                            {/* Render Approve/Reject buttons only if status is 'Pending' */}

                                                            {account.account_status === 'Pending' && (

                                                                <>

                                                                    <button

                                                                        className="btn btn-success-light"

                                                                        onClick={() => handleAccountStatusUpdate(account.account_id, 'Active')}

                                                                        disabled={isUpdating} // Disable all buttons while an update is in progress

                                                                        title="Approve Account"

                                                                    >

                                                                        <CheckCircle size={16} className="mr-1" /> Approve

                                                                    </button>

                                                                    <button

                                                                        className="btn btn-error-light"

                                                                        onClick={() => handleAccountStatusUpdate(account.account_id, 'Rejected')}

                                                                        disabled={isUpdating} // Disable all buttons while an update is in progress

                                                                        title="Reject Account"

                                                                    >

                                                                        <XCircle size={16} className="mr-1" /> Reject

                                                                    </button>

                                                                </>

                                                            )}

                                                            {/* Render Reset to Pending button if status is Active or Rejected */}

                                                            {(account.account_status === 'Active' || account.account_status === 'Rejected') && (

                                                                <button

                                                                    className="btn btn-info"

                                                                    onClick={() => handleAccountStatusUpdate(account.account_id, 'Pending')}

                                                                    disabled={isUpdating} // Disable all buttons while an update is in progress

                                                                    title="Reset Account Status to Pending"

                                                                >

                                                                    Reset to Pending

                                                                </button>

                                                            )}

                                                            {/* NEW: Delete Account Button - Triggers password verification */}

                                                            <button

                                                                className="btn btn-error" // Using 'btn-error' for a distinct red delete button

                                                                onClick={() => initiateAccountDeletion(account.account_id, account.account_no)}

                                                                disabled={isUpdating} // Disable if any update/delete operation is in progress

                                                                title={`Delete Account ${account.account_no}`}

                                                            >

                                                                <Trash2 size={16} className="mr-1" /> Delete

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            ) : (

                                <p className="text-text-secondary text-center py-4">No accounts linked to this customer.</p>

                            )}

                        </div>

                    </div>

                </div>

            </main>



            <AdminPassVer

                isOpen={showPasswordModal}

                onClose={() => {

                    setShowPasswordModal(false);

                    setPasswordModalError(null); // Clear error when closing

                    setAccountToDelete(null); // Clear account to delete

                }}

                onVerify={handlePasswordVerification}

                isLoading={passwordModalLoading}

                errorMessage={passwordModalError}

            />

        </div>

    );

};



export default CustomerDetailsPage;