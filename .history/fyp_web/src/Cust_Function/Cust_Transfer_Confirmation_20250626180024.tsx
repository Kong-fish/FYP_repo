import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import { ArrowLeft } from 'lucide-react';
import '../shared/normalize.css';
import './CustFunction.css'; 
import Cust_Pass_Ver from '../Cust_Function/Cust_Pass_Ver.tsx'; 

// Re-use the Header component for consistency across pages
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

    // Function to navigate back to the customer dashboard
    const handleBack = () => {
        navigate("/customer-dashboard");
    };

    return (
        <header className="header">
            <div className="header__content">
                {/* Back Button with text */}
                <button onClick={handleBack} className="back-button">
                    <ArrowLeft size={24} />
                    <span className="back-button-text">Back</span>
                </button>

                <div className="logo-section">
                    {/* Using an emoji as a simple icon. Consider using Lucide for consistency or SVG if more complex. */}
                    <span className="logo-icon">🏦</span>
                    <h1 className="logo-text">Eminent Western</h1>
                </div>
                <nav className="header-nav"></nav>
                <div className="header-actions">
                    <DarkModeToggle />
                    <button onClick={handleSignOut} className="sign-out-button header-sign-out-btn">
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};

// Interface for account information
interface AccountInfo {
    account_id: string;
    account_no: string;
    account_type: string;
    balance: number;
    nickname?: string;
}

// Define an interface for the state passed to this page
interface TransferConfirmationState {
    initiatorAccountId: string;
    receiverAccountNo: string;
    receiverAccountId: string; // Needed for updating recipient balance by ID
    amount: number;
    purpose: string;
    typeOfTransfer: string; // Added this field
    initiatorAccountDetails: AccountInfo; // Changed from AccountDetails to AccountInfo for consistency
    recipientAccountDetails: AccountInfo; // Changed from AccountDetails to AccountInfo for consistency
}

export default function Cust_Transfer() { // Renamed from Cust_Tran_Confirmation to Cust_Transfer
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const [loading, setLoading] = useState<boolean>(true); // For initial account fetch
    const [processing, setProcessing] = useState(false); // For transfer confirmation
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<AccountInfo[]>([]); // State for accounts to be selected from
    const [fromAccount, setFromAccount] = useState<string>(''); // Selected from account ID
    const [toAccountNo, setToAccountNo] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [purpose, setPurpose] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [confirmationDetails, setConfirmationDetails] = useState<any>(null); // Details to pass to confirmation screen

    // State for password verification modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [verificationError, setVerificationError] = useState(''); // Specific error for verification modal
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Initial fetch for user accounts when component mounts
    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    throw new Error('No active session. Please log in.');
                }
                const userUuid = session.user.id;
                setUserEmail(session.user.email ?? null); // Set user email here

                const { data: customerData, error: customerError } = await supabase
                    .from('Customer')
                    .select('customer_id')
                    .eq('user_uuid', userUuid)
                    .single();

                if (customerError || !customerData) {
                    throw new Error('Could not retrieve customer details.');
                }
                const customerId = customerData.customer_id;

                const { data: accountsData, error: accountsError } = await supabase
                    .from('Account')
                    .select('account_id, account_no, account_type, balance, nickname')
                    .eq('customer_id', customerId);

                if (accountsError || !accountsData) {
                    throw new Error(`Failed to load accounts: ${accountsError?.message}`);
                }

                setAccounts(accountsData as AccountInfo[]);
                if (accountsData.length > 0) {
                    setFromAccount(accountsData[0].account_id); // Set default 'from' account
                }

            } catch (err: any) {
                console.error('Error fetching accounts:', err.message);
                setError(`Error: ${err.message}`);
                if (err.message.includes('No active session') || err.message.includes('Unauthorized')) {
                    navigate('/customer-landing'); // Redirect if not logged in or unauthorized
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, [navigate]);

    // Handle initial state if coming from a redirect with confirmation details (not used directly in this version's flow but kept for safety)
    useEffect(() => {
        if (state) {
            setConfirmationDetails(state as TransferConfirmationState);
            setShowConfirmation(true);
            setLoading(false); // If state is passed, no need to show loading accounts
        }
    }, [state]);


    // Redirect if critical state is missing (e.g., direct navigation to confirmation)
    // This check is now adapted for the main transfer page
    if (!loading && !showConfirmation && accounts.length === 0 && !error) {
        // If accounts failed to load and no other error, could be a navigation issue or no accounts
        // We'll show an error message and allow user to reload.
        // Or if it's the confirmation path, and details are missing, redirect.
        if (location.pathname.includes('transfer-confirmation') && !confirmationDetails) {
            console.warn("Missing transfer details. Redirecting to transfer initiation.")
            navigate("/customer-transfer") // Redirect back to the transfer form
            return null
        }
    }


    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and a single decimal point
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/;
        if (value === '' || regex.test(value)) {
            setAmount(value);
        }
    };

    const handleTransferFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const transferAmount = parseFloat(amount);

        if (!fromAccount || !toAccountNo || isNaN(transferAmount) || transferAmount <= 0) {
            setError('Please fill in all required fields and ensure the amount is valid.');
            return;
        }

        const selectedFromAccount = accounts.find(acc => acc.account_id === fromAccount);
        if (!selectedFromAccount) {
            setError('Invalid "from" account selected.');
            return;
        }

        if (selectedFromAccount.balance < transferAmount) {
            setError('Insufficient funds in the selected account.');
            return;
        }

        // Fetch recipient account details using toAccountNo
        const { data: recipientAccount, error: recipientError } = await supabase
            .from('Account')
            .select('account_id, account_no, account_type, balance, nickname') // Fetch type, balance, and nickname for display
            .eq('account_no', toAccountNo)
            .single();

        if (recipientError || !recipientAccount) {
            setError('Recipient account not found. Please verify the account number.');
            console.error('Error fetching recipient account:', recipientError?.message);
            return;
        }

        // Prevent transfer to self if account_no is the same
        if (selectedFromAccount.account_no === recipientAccount.account_no) {
            setError('Cannot transfer money to the same account.');
            return;
        }

        // Set confirmation details before showing the confirmation modal
        setConfirmationDetails({
            fromAccountDisplay: `${selectedFromAccount.account_type}${selectedFromAccount.nickname ? ` (${selectedFromAccount.nickname})` : ''} (****${selectedFromAccount.account_no.slice(-4)})`,
            toAccountDisplay: `${recipientAccount.account_type}${recipientAccount.nickname ? ` (${recipientAccount.nickname})` : ''} (****${recipientAccount.account_no.slice(-4)})`,
            amount: transferAmount,
            purpose: purpose || 'General Transfer',
            typeOfTransfer: 'Customer Transfer', // Or dynamically set
            initiatorAccountId: selectedFromAccount.account_id,
            recipientAccountId: recipientAccount.account_id,
            recipientAccountNo: recipientAccount.account_no,
            initiatorAccountDetails: selectedFromAccount, // Pass full details for display
            recipientAccountDetails: recipientAccount,     // Pass full details for display
        });
        setShowConfirmation(true); // Show the confirmation section
    };

    // This function is called by the Cust_Pass_Ver modal on successful password verification
    const handlePasswordVerify = async (password: string) => {
        setVerificationError(''); // Clear previous verification errors

        if (!userEmail) {
            setVerificationError('User email not found for verification.');
            return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password,
        });

        if (signInError) {
            console.error('Password verification failed:', signInError.message);
            if (signInError.message.includes("Invalid login credentials")) {
                setVerificationError('Incorrect password. Please try again.');
            } else {
                setVerificationError(`Verification failed: ${signInError.message}`);
            }
            return; // Stop if verification fails
        }

        // If password verification succeeds, proceed with the actual transfer
        setShowPasswordModal(false); // Close the modal
        await confirmTransfer(); // Call the transfer logic
    };


    const confirmTransfer = async () => {
        setProcessing(true); // Set processing for the actual transfer
        setError(null);

        if (!confirmationDetails) {
            setError("Confirmation details missing for processing.");
            setProcessing(false);
            setShowConfirmation(false);
            return;
        }

        const { initiatorAccountId, recipientAccountId, recipientAccountNo, amount: transferAmount, purpose: transPurpose, typeOfTransfer } = confirmationDetails;

        try {
            // Fetch latest balances again for strong consistency, and optimistic locking if available (not directly in Supabase client, but good practice)
            const { data: currentInitiatorAccount, error: initiatorFetchError } = await supabase
                .from('Account')
                .select('balance')
                .eq('account_id', initiatorAccountId)
                .single();

            if (initiatorFetchError || !currentInitiatorAccount) {
                throw new Error(`Failed to fetch current initiator balance: ${initiatorFetchError?.message}`);
            }

            if (currentInitiatorAccount.balance < transferAmount) {
                throw new Error("Insufficient balance. Transfer cannot be completed.");
            }

            const { data: currentRecipientAccount, error: recipientFetchError } = await supabase
                .from('Account')
                .select('balance')
                .eq('account_id', recipientAccountId)
                .single();

            if (recipientFetchError || !currentRecipientAccount) {
                throw new Error(`Failed to fetch current recipient balance: ${recipientFetchError?.message}`);
            }


            // Step 1: Deduct from initiator account
            const newInitiatorBalance = currentInitiatorAccount.balance - transferAmount;
            const { error: debitError } = await supabase
                .from('Account')
                .update({ balance: newInitiatorBalance })
                .eq('account_id', initiatorAccountId);

            if (debitError) {
                console.error('Error deducting from initiator account:', debitError.message);
                throw new Error(`Transfer failed at deduction: ${debitError.message}`);
            }

            // Step 2: Add to receiver account
            const newRecipientBalance = currentRecipientAccount.balance + transferAmount;
            const { error: creditError } = await supabase
                .from('Account')
                .update({ balance: newRecipientBalance })
                .eq('account_id', recipientAccountId);

            if (creditError) {
                console.error('Error adding to receiver account:', creditError.message);
                // IMPORTANT: In a real app, you would need to implement a rollback or compensation for the deducted amount here.
                throw new Error(`Transfer failed at crediting: ${creditError.message}. Funds may have been deducted. Contact support.`);
            }

            // Step 3: Record the transaction
            const { data: transactionInsertData, error: transactionInsertError } = await supabase
                .from('Transaction')
                .insert([
                    {
                        initiator_account_id: initiatorAccountId,
                        receiver_account_no: recipientAccountNo,
                        amount: transferAmount,
                        purpose: transPurpose,
                        type_of_transfer: typeOfTransfer
                    }
                ])
                .select('transaction_id'); // Select the transaction_id to pass to completion page

            if (transactionInsertError) {
                console.error('Error recording transaction:', transactionInsertError.message);
                // IMPORTANT: If this fails, balances are updated but no record exists.
                throw new Error(`Transfer completed but failed to record: ${transactionInsertError.message}. Check statement.`);
            }

            setSuccessMessage('Transfer completed successfully!');
            // Reset form fields
            setFromAccount(accounts.length > 0 ? accounts[0].account_id : '');
            setToAccountNo('');
            setAmount('');
            setPurpose('');
            setShowConfirmation(false); // Hide confirmation
            setConfirmationDetails(null); // Clear confirmation details

            // Re-fetch accounts to show updated balances on the main form if user goes back
            const { data: updatedAccountsData, error: updatedAccountsError } = await supabase
                .from('Account')
                .select('account_id, account_no, account_type, balance, nickname')
                .eq('customer_id', (await supabase.from('Customer').select('customer_id').eq('user_uuid', (await supabase.auth.getSession()).data.session?.user.id).single()).data?.customer_id);

            if (!updatedAccountsError && updatedAccountsData) {
                setAccounts(updatedAccountsData as AccountInfo[]);
            }

            // Navigate to success page with full details including transactionId
            navigate("/customer-transfer-complete", {
                state: {
                    status: "success",
                    typeOfTransfer: typeOfTransfer,
                    amount: transferAmount,
                    recipientName: confirmationDetails?.toAccountDisplay, // Pass the formatted recipient name
                    transactionId: transactionInsertData?.[0]?.transaction_id, // Pass the generated transaction ID
                    timestamp: new Date().toLocaleString()
                }
            });


        } catch (err: any) {
            console.error('Error during transfer confirmation:', err.message);
            setError(`Error: ${err.message}`);
            setSuccessMessage(null); // Clear any lingering success messages
            setShowConfirmation(false); // Hide confirmation on error
            setConfirmationDetails(null); // Clear confirmation details
            // Navigate to failure page with error message
            navigate("/transfer-complete", {
                state: {
                    status: "failure",
                    message: err.message,
                    typeOfTransfer: typeOfTransfer,
                    amount: transferAmount, // Still pass amount for context
                    recipientName: confirmationDetails?.toAccountDisplay // Still pass recipient for context
                }
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setConfirmationDetails(null);
        navigate("/customer-dashboard");
    };

    // Helper function to format account number for display
    const formatAccountNo = (accountNo: string) => {
        if (!accountNo) return "";
        return `****${accountNo.slice(-4)}`;
    };

    if (loading && !showConfirmation) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="customer-function-container">
                    <div className="customer-function-content" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="customer-loading-message">Loading accounts...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <Header />
            <div className="customer-function-container">
                <div className="customer-function-content">
                    <div className="customer-card">
                        {!showConfirmation ? (
                            <>
                                <div className="customer-card-header">
                                    <h2 className="customer-card-title">Money Transfer</h2>
                                </div>

                                {error && (
                                    <div className="customer-error-message">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="customer-success-message">
                                        {successMessage}
                                    </div>
                                )}

                                <form onSubmit={handleTransferFormSubmit} className="customer-form">
                                    <div className="customer-form-group">
                                        <label htmlFor="fromAccount" className="customer-form-label">From Account:</label>
                                        <select
                                            id="fromAccount"
                                            name="fromAccount"
                                            value={fromAccount}
                                            onChange={(e) => setFromAccount(e.target.value)}
                                            className="customer-form-input"
                                            required
                                        >
                                            {accounts.length === 0 && <option value="">No accounts available</option>}
                                            {accounts.map(account => (
                                                <option key={account.account_id} value={account.account_id}>
                                                    {account.account_type} {account.nickname ? `(${account.nickname})` : ''} (****{account.account_no.slice(-4)}) - Balance: ${account.balance?.toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="customer-form-group">
                                        <label htmlFor="toAccountNo" className="customer-form-label">To Account Number:</label>
                                        <input
                                            type="text"
                                            id="toAccountNo"
                                            name="toAccountNo"
                                            value={toAccountNo}
                                            onChange={(e) => setToAccountNo(e.target.value)}
                                            className="customer-form-input"
                                            placeholder="Enter recipient's full account number"
                                            required
                                        />
                                    </div>

                                    <div className="customer-form-group">
                                        <label htmlFor="amount" className="customer-form-label">Amount:</label>
                                        <input
                                            type="text"
                                            id="amount"
                                            name="amount"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            className="customer-form-input"
                                            placeholder="e.g., 100.00"
                                            required
                                        />
                                    </div>

                                    <div className="customer-form-group">
                                        <label htmlFor="purpose" className="customer-form-label">Purpose (Optional):</label>
                                        <input
                                            type="text"
                                            id="purpose"
                                            name="purpose"
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            className="customer-form-input"
                                            placeholder="e.g., Monthly Rent"
                                        />
                                    </div>

                                    <div className="customer-button-group">
                                        <button type="submit" className="customer-primary-button" disabled={loading || processing}>
                                            Next: Confirm Transfer
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="customer-confirmation-section">
                                <h3>Confirm Transfer Details</h3>
                                <div className="customer-confirmation-details">
                                    <p><strong>Transferring From:</strong> {confirmationDetails?.fromAccountDisplay}</p>
                                    <p><strong>Transferring To:</strong> {confirmationDetails?.toAccountDisplay}</p>
                                    <p><strong>Amount:</strong> ${confirmationDetails?.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p><strong>Purpose:</strong> {confirmationDetails?.purpose}</p>
                                    <p><strong>Type of Transfer:</strong> {confirmationDetails?.typeOfTransfer}</p>
                                </div>
                                <p className="customer-warning-text">
                                    Please double-check the details above. This action cannot be undone.
                                </p>
                                <div className="customer-button-group">
                                    <button onClick={handleCancel} className="customer-secondary-button" disabled={processing}>
                                        Cancel
                                    </button>
                                    {/* Modified onClick to handle missing userEmail more explicitly */}
                                    <button onClick={() => {
                                        if (!userEmail) {
                                            setError("User email not available for verification. Please refresh or log in again.");
                                            return;
                                        }
                                        setShowPasswordModal(true);
                                    }} className="customer-primary-button" disabled={processing}>
                                        {processing ? 'Processing...' : 'Confirm & Transfer'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="dashboard-footer">
                    <div className="footer-content">
                        <p className="footer-copyright">© {new Date().getFullYear()} Eminent Western. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#" className="footer-link">Privacy</a>
                            <a href="#" className="footer-link">Terms</a>
                            <a href="#" className="footer-link">Help</a>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Password Verification Modal */}
            {showPasswordModal && (
                <Cust_Pass_Ver
                    isOpen={showPasswordModal}
                    onClose={() => {
                        setShowPasswordModal(false);
                        setVerificationError(''); // Clear verification error on close
                    }}
                    onVerify={handlePasswordVerify} // This will be called upon successful verification
                    verificationError={verificationError}
                />
            )}
        </div>
    );
}
