// src/Dashboard/Customer_Dashboard.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Banknote, BarChart, History, Shield, Settings, PlusCircle, Eye, EyeOff } from 'lucide-react';

import DarkModeToggle from '../shared/DarkModeToggle.tsx';
import supabase from '../supbaseClient.js';
import Cust_Pass_Ver from './Cust_Pass_Ver.tsx';

// Header Component (consistent with other customer function pages)
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

    return (
        <header className="header">
            <div className="header__content">
                <h1 className="header__title">Eminent Western</h1>
                <nav className="header-nav">
                </nav>
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

// Interface for Account data, matching Supabase schema fields for accounts
interface Account {
    id: string; // Corresponds to account_id
    type: string; // Corresponds to account_type
    number: string; // Corresponds to account_no (masked)
    balance: number;
    limit?: number; // Optional, primarily for Credit Cards
    nickname?: string;
}

// Interface for Transaction data, matching Supabase schema fields for transactions
interface Transaction {
    id: string; // Corresponds to transaction_id
    description: string; // Corresponds to purpose
    amount: number;
    date: string; // Corresponds to transfer_datetime (formatted)
    type: 'debit' | 'credit'; // Derived based on transaction direction
}

// Interface for Customer information
interface CustomerInfo {
    id: string | null; // Corresponds to customer_id
    firstName: string;
    lastName: string;
    lastLogin: string; // Formatted last sign-in time
}

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        id: null,
        firstName: '',
        lastName: '',
        lastLogin: 'N/A',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBalances, setShowBalances] = useState(true);

    // --- State for the password verification modal ---
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    // State to store which action to perform after successful verification
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    // --- End modal states ---

    // useEffect hook to fetch user session and customer profile on component mount
    useEffect(() => {
        const getCustomerSessionAndProfile = async () => {
            setLoading(true);
            setError(null);
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Error getting session:', sessionError.message);
                setError('Failed to load user session. Please try again.');
                navigate('/customer-landing'); // Redirect to landing page if session fails
                setLoading(false);
                return;
            }

            if (!sessionData?.session) {
                navigate('/customer-landing'); // Redirect if no active session
                setLoading(false);
                return;
            }

            const userUuid = sessionData.session.user.id;
            const lastSignInAt = sessionData.session.user.last_sign_in_at;

            // Fetch customer details from 'Customer' table using user_uuid
            const { data: customerData, error: customerError } = await supabase
                .from('Customer')
                .select('customer_id, first_name, last_name')
                .eq('user_uuid', userUuid)
                .single(); // Expecting a single customer record for the user_uuid

            if (customerError) {
                console.error('Error fetching customer profile:', customerError.message);
                setError('Failed to load customer profile.');
                setCustomerInfo(prev => ({
                    ...prev,
                    lastLogin: lastSignInAt ? new Date(lastSignInAt).toLocaleString() : 'N/A'
                }));
                setLoading(false);
                return;
            }

            if (customerData) {
                setCustomerInfo({
                    id: customerData.customer_id,
                    firstName: customerData.first_name || '',
                    lastName: customerData.last_name || '',
                    lastLogin: lastSignInAt ? new Date(lastSignInAt).toLocaleString() : 'N/A',
                });
            } else {
                setError('Customer profile not found.');
                navigate('/customer-landing'); // Redirect if customer profile is not found
            }
            setLoading(false);
        };

        getCustomerSessionAndProfile();

        // Listen for authentication state changes and re-fetch profile/accounts if state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                // Clear customer data if logged out
                setCustomerInfo({ id: null, firstName: '', lastName: '', lastLogin: 'N/A' });
                setAccounts([]);
                setRecentTransactions([]);
                navigate('/customer-landing'); // Redirect on logout
            } else {
                getCustomerSessionAndProfile(); // Re-fetch on login
            }
        });

        // Cleanup the auth listener on component unmount
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]); // Dependency array includes navigate to avoid linting warnings

    // useEffect hook to fetch accounts and transactions once customerInfo.id is available
    useEffect(() => {
        const fetchAccountsAndTransactions = async () => {
            if (!customerInfo.id) {
                // Do not fetch if customer ID is not yet available
                setAccounts([]);
                setRecentTransactions([]);
                return;
            }
            setLoading(true);
            setError(null);

            // Fetch accounts associated with the customer_id
            const { data: accountsData, error: accountsError } = await supabase
                .from('Account')
                .select('account_id, account_no, account_type, balance, nickname')
                .eq('customer_id', customerInfo.id)
                .order('created_at', { ascending: true }); // Order accounts by creation date

            if (accountsError) {
                console.error('Error fetching accounts:', accountsError.message);
                setError('Failed to load bank accounts.');
                setAccounts([]);
            } else {
                // Format account data for display, masking account numbers
                const formattedAccounts: Account[] = accountsData.map(acc => ({
                    id: acc.account_id,
                    type: acc.account_type,
                    number: acc.account_no ? acc.account_no.slice(-4) : 'N/A', // Show only last 4 digits
                    balance: acc.balance,
                    limit: acc.account_type === 'Credit Card' ? 5000 : undefined, // Placeholder credit card limit
                    nickname: acc.nickname,
                }));
                setAccounts(formattedAccounts);
            }

            // Fetch all account_ids belonging to the current customer for transaction fetching
            const { data: customerAccountIds, error: accountIdError } = await supabase
                .from('Account')
                .select('account_id')
                .eq('customer_id', customerInfo.id);

            if (accountIdError) {
                console.error('Error fetching customer account IDs for transactions:', accountIdError.message);
                setError('Failed to load transaction history.');
                setRecentTransactions([]);
                setLoading(false);
                return;
            }

            const relevantAccountIds = customerAccountIds.map(acc => acc.account_id);

            if (relevantAccountIds.length === 0) {
                // If no accounts, no transactions to fetch
                setRecentTransactions([]);
                setLoading(false);
                return;
            }

            // Fetch recent transactions where the customer's account is either the initiator or receiver
            const { data: transactionsData, error: transactionsError } = await supabase
                .from('Transaction')
                .select('transaction_id, initiator_account_id, receiver_account_no, amount, purpose, transfer_datetime')
                .in('initiator_account_id', relevantAccountIds) // Transactions initiated by customer's accounts
                .order('transfer_datetime', { ascending: false }) // Newest transactions first
                .limit(4); // Limit to a few recent transactions

            if (transactionsError) {
                console.error('Error fetching transactions:', transactionsError.message);
                setError('Failed to load recent transactions.');
                setRecentTransactions([]);
            } else {
                // Format transaction data for display
                const formattedTransactions: Transaction[] = transactionsData.map(trans => {
                    const isDebit = relevantAccountIds.includes(trans.initiator_account_id);
                    return {
                        id: trans.transaction_id,
                        description: trans.purpose || 'N/A',
                        amount: Math.abs(trans.amount), // Always display amount as positive
                        date: trans.transfer_datetime ? new Date(trans.transfer_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                        type: isDebit ? 'debit' : 'credit', // Set type for styling
                    };
                });
                setRecentTransactions(formattedTransactions);
            }
            setLoading(false);
        };

        fetchAccountsAndTransactions();
    }, [customerInfo.id]); // Rerun effect when customerInfo.id changes

    // Toggles the visibility of financial balances
    const toggleShowBalances = () => {
        setShowBalances(prev => !prev);
    };

    // --- Functions for password verification workflow ---

    // This function is called by button handlers to open the modal
    const openVerificationModal = (action: () => void, title?: string, description?: string) => {
      setPendingAction(() => action); // Store the action to be performed after verification
      setVerificationError(null); // Clear any previous verification errors
      setIsVerificationModalOpen(true); // Open the modal
    };

    // This function is passed to the modal and called when the user submits their password
    const handlePasswordVerify = async (password: string) => {
        setVerificationError(null); // Clear any existing errors

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: supabase.auth.user?.email || '', // Get current user's email
            password: password,
        });

        if (authError) {
            console.error('Password verification failed:', authError.message);
            setVerificationError('Incorrect password. Please try again.');
            return;
        }

        // If verification is successful, execute the stored pending action
        if (pendingAction) {
            pendingAction();
        }
        setIsVerificationModalOpen(false); // Close the modal
        setPendingAction(null); // Clear the pending action
    };

    // This function is called by the modal to close itself
    const closeVerificationModal = () => {
        setIsVerificationModalOpen(false);
        setPendingAction(null); // Clear pending action if modal is closed without verification
        setVerificationError(null); // Clear any verification errors
    };
    // --- End new functions ---

    // Modify other button click handlers to use the verification modal
    const handleViewAccountDetails = (accountId: string) => {
        openVerificationModal(
            () => navigate(`/customer-account-details/${accountId}`),
            'View Account Details',
            'Enter your password to view detailed account information.'
        );
    };

    const handleTransferClick = () => {
        openVerificationModal(
            () => navigate('/customer-transfer'),
            'Initiate Transfer',
            'Enter your password to proceed with a money transfer.'
        );
    };

    const handleLoanApplyClick = () => {
        openVerificationModal(
            () => navigate('/customer-loan-apply'),
            'Apply for Loan',
            'Enter your password to proceed with a loan application.'
        );
    };

    const handleCreateAccountClick = () => {
        openVerificationModal(
            () => navigate('/customer-new-bank-acc'),
            'Create New Account',
            'Enter your password to create a new bank account.'
        );
    };

    const handleViewApplicationsClick = () => {
        openVerificationModal(
            () => navigate('/customer-view-approval'),
            'View Applications',
            'Enter your password to view your applications.'
        );
    };

    const handleTransactionHistoryClick = () => {
        openVerificationModal(
            () => navigate('/customer-transactions-history'),
            'View Transaction History',
            'Enter your password to view your transaction history.'
        );
    };

    const handleAccountSettingsClick = () => {
        openVerificationModal(
            () => navigate('/customer-profile-edit'),
            'Account Settings',
            'Enter your password to access account settings.'
        );
    };

    const handleViewAllTransactionsClick = () => {
        openVerificationModal(
            () => navigate('/transactions'),
            'View All Transactions',
            'Enter your password to view all your transactions.'
        );
    };

    // Displays a loading message while data is being fetched
    if (loading) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="dashboard-container">
                    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="loading-message">Loading dashboard data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Displays an error message if data fetching fails
    if (error) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="dashboard-container">
                    <div className="container" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
                        <p>Error: {error}</p>
                        <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>Reload</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                /* src/Cust_Function/Cust_Function.css - MERGED */

                /* Header Styles (consistent with shared Header.css but specific overrides here) */
                .header {
                    height: 100px; /* Fixed height for the header */
                    box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.08); /* Fixed shadow, not tied to var(--header-shadow) */
                    width: 100vw;
                    background-color: #385a93; /* Fixed header background color */
                    display: flex;
                    justify-content: center;
                    position: fixed;
                    top: 0;
                    z-index: 999;
                }

                .header__content {
                    width: 100%;
                    max-width: 1200px;
                    display: flex;
                    margin: 0 auto;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    padding: 0 20px; /* Padding for content inside the header */
                }

                /* Logo and Title styles */
                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .logo-text {
                    font-family: 'Trebuchet MS', sans-serif; /* Specific font for header title */
                    color: #fff; /* White text for the title, fixed */
                    font-size: 30px;
                    white-space: nowrap;
                    margin: 0; /* Remove default margin */
                }

                /* Adjustments for the back button */
                .back-button {
                    background: none;
                    border: none;
                    color: #fff; /* White color for the back button text and icon */
                    cursor: pointer;
                    padding: 8px;
                    border-radius: var(--border-radius);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    transition: background-color 0.2s ease;
                    margin-right: 15px; /* Space between back button and logo */
                }

                .back-button svg {
                    /* For the Lucide React ArrowLeft icon */
                    color: #fff; /* Ensure the icon is also white */
                }

                .back-button:hover {
                    background-color: rgba(255, 255, 255, 0.1); /* Subtle white hover effect */
                }

                .back-button-text {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #fff; /* Ensure text is white */
                }

                /* Header actions (for DarkModeToggle and Sign Out button) */
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                /* Updated Sign Out Button to Yellow */
                .sign-out-button {
                    background-color: var(--yellow-button-bg);
                    color: var(--yellow-button-text);
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--border-radius);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .sign-out-button:hover {
                    background-color: var(--yellow-button-hover-bg);
                }

                /* General Layout */
                .dashboard-container {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background-color: var(--background);
                    color: var(--text);
                }

                .dashboard-main {
                    flex-grow: 1;
                    padding: 2rem 0;
                }

                /* MODIFICATION: Adjustments for dashboard-layout padding */
                .dashboard-layout {
                    display: flex;
                    gap: 2rem;
                    /* Removed default horizontal padding here to allow content to expand more.
                    Padding will be added within main-content for inner spacing. */
                    padding: 0;
                    /* Add max-width here if you want to explicitly limit the entire layout,
                    but usually, main-content's max-width is sufficient. */
                }

                /* MODIFICATION: Responsive padding for dashboard-layout */
                @media (min-width: 1441px) { /* For very large screens, add some outer padding */
                    .dashboard-layout {
                        padding: 0 4rem; /* Example: 4rem padding on very wide displays */
                    }
                }

                @media (max-width: 1440px) { /* Laptops and below */
                    .dashboard-layout {
                        padding: 0 2rem; /* Add some general padding for typical laptop sizes */
                    }
                }

                @media (max-width: 768px) { /* Tablets */
                    .dashboard-layout {
                        flex-direction: column; /* Stack sidebar and main content */
                        gap: 1.5rem; /* Adjust gap when stacked */
                        padding: 0 1rem; /* Reduce padding for tablets */
                    }
                }

                @media (max-width: 480px) { /* Phones */
                    .dashboard-layout {
                        padding: 0 0.5rem; /* Even less padding for small phones */
                    }
                }

                /* MODIFICATION: Adjustments for main-content width and max-width for readability */
                .main-content {
                    flex-grow: 1;
                    width: 100%; /* Will take 100% of available space from its parent */
                    /* Set a max-width that allows it to expand sufficiently but prevents over-stretching
                    on ultra-wide monitors for better readability. */
                    max-width: 1600px; /* Increased max-width example, adjust as needed */
                    margin: 0 auto; /* Keeps it centered within dashboard-layout's available space */
                    padding: 0; /* Removing internal padding here, as we'll apply it to transactions-card */
                }


                /* Transactions Card (general card style) */
                .transactions-card {
                    background-color: var(--card-background);
                    border-radius: var(--border-radius);
                    box-shadow: var(--box-shadow);
                    padding: 2rem; /* Default padding for larger screens */
                    margin-top: 70px; /* Increased margin from the top */
                    border: 2px solid var(--border); /* Increased border thickness */
                    /* Assuming any max-width from CustomerDas.and.css on this class is removed or increased */
                    width: 100%; /* Ensure it always takes 100% of its parent's (main-content) width */
                }

                /* MODIFICATION: Adjust padding for transactions-card on tablets/smaller devices */
                @media (max-width: 768px) {
                    .transactions-card {
                        padding: 1.5rem; /* Reduce padding on tablets/smaller devices */
                    }
                }

                /* MODIFICATION: Adjust padding for transactions-card on phones */
                @media (max-width: 480px) {
                    .transactions-card {
                        padding: 1rem; /* Even smaller padding for phones */
                    }
                }

                /* Transactions Content (inside the card) */
                .transactions-content {
                    padding: 0; /* Content inside the card, adjust as needed per component */
                }

                .transactions-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .transactions-title {
                    font-size: 2rem;
                    color: var(--heading-color);
                    margin-bottom: 0;
                }

                /* Loading Message */
                .loading-message {
                    text-align: center;
                    color: var(--text);
                    padding: 2rem;
                    font-size: 1.1rem;
                }

                /* Error Message Box */
                .error-message-box {
                    background-color: var(--error-background);
                    color: var(--error-color);
                    border: 1px solid var(--error-border);
                    border-radius: var(--border-radius);
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-weight: 500;
                }

                /* --- FORM STYLES (for Cust_Transfer and Cust_Edit_Profile) --- */
                .transfer-form, .profile-edit-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem; /* Space between form groups */
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem; /* Space between label and input/select */
                }

                .form-label {
                    font-weight: 600;
                    color: var(--heading-color);
                    font-size: 0.875rem; /* Smaller font for labels */
                }

                .form-input {
                    padding: 0.75rem;
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border);
                    background-color: var(--input-background-color);
                    color: var(--input-text-color);
                    font-size: 1rem;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                    width: 100%; /* Ensure inputs take full width of their container */
                }

                .form-input:focus {
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 2px var(--primary-light); /* Subtle focus ring */
                }

                /* Styles for select element specifically */
                .transfer-form select.form-input {
                    appearance: none; /* Remove default arrow in some browsers */
                    background-image: url('data:image/svg+xml;utf8,<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>'); /* Custom arrow */
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    background-size: 1em;
                    padding-right: 2.5rem; /* Make space for the custom arrow */
                }

                /* --- SHARED BUTTON STYLES --- */
                .button-group {
                    display: flex;
                    gap: 1rem; /* Space between buttons */
                    margin-top: 2rem; /* Increased space between last input field and buttons */
                    justify-content: flex-end; /* Align buttons to the right */
                }

                .primary-button {
                    background-color: var(--primary);
                    color: var(--button-text-color);
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--border-radius);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    flex: 1; /* Allow buttons to grow and share space */
                    max-width: 250px; /* Limit max width for larger screens */
                }

                .primary-button:hover {
                    background-color: var(--primary-dark);
                }

                .secondary-button {
                    background-color: transparent;
                    color: var(--primary);
                    border: 1px solid var(--primary);
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--border-radius);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease, color 0.2s ease;
                    flex: 1; /* Allow buttons to grow and share space */
                    max-width: 250px; /* Limit max width for larger screens */
                }

                .secondary-button:hover {
                    background-color: var(--primary-light-transparent); /* Semi-transparent primary color on hover */
                    color: var(--primary-dark);
                }

                /* --- NEW STYLES FOR CONFIRMATION PAGE (Cust_Tran_Confirmation) --- */
                .confirmation-details {
                    background-color: var(--input-background-color); /* Use input background for details box */
                    border: 1px solid var(--border);
                    border-radius: var(--border-radius);
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    text-align: left;
                    line-height: 1.8;
                    color: var(--text);
                }

                .confirmation-details p {
                    margin-bottom: 0.5rem;
                    color: var(--text-color-light);
                }

                .confirmation-details strong {
                    color: var(--text);
                }

                .warning-text {
                    color: var(--error-color); /* Use error color for warnings */
                    font-weight: bold;
                    margin-top: 1.5rem;
                }


                /* --- NEW STYLES FOR COMPLETION PAGE (Cust_Tran_Complete) --- */
                .completion-content {
                    padding: 3rem 2rem; /* More padding for a central content area */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 250px; /* Ensure a decent height */
                    text-align: center;
                }

                .completion-icon {
                    font-size: 4rem; /* Larger icon */
                    margin-bottom: 1rem;
                }

                .completion-text {
                    color: var(--text-color-light);
                    margin-bottom: 2rem;
                    font-size: 1.1rem;
                }

                /* Status-specific borders for the .transactions-card container in completion page */
                .transactions-card.status-success {
                    border: 2px solid var(--success-color);
                }

                .transactions-card.status-failure {
                    border: 2px solid var(--error-color);
                }

                .transactions-card.status-warning {
                    border: 2px solid var(--warning-color);
                }

                /* --- RESPONSIVE ADJUSTMENTS --- */
                /* The general 768px media query is mostly for stacking elements,
                    padding adjustments are now more granular per component. */
                @media (max-width: 768px) {
                    /* Header responsive adjustments (from previous response) */
                    .header {
                        height: auto;
                        padding: 1rem 0;
                    }

                    .header__content {
                        flex-wrap: wrap;
                        justify-content: center;
                        padding: 0 10px;
                    }

                    .logo-section {
                        width: 100%;
                        justify-content: center;
                        margin-bottom: 1rem;
                    }

                    .logo-text {
                        font-size: 23px;
                    }

                    .header-actions {
                        width: 100%;
                        justify-content: center;
                        gap: 10px;
                    }

                    .back-button {
                        position: absolute;
                        left: 10px;
                        top: 10px;
                        margin-right: 0;
                    }

                    .back-button svg {
                        width: 20px;
                        height: 20px;
                    }

                    .back-button-text {
                        font-size: 0.9rem;
                    }

                    /* main-content and dashboard-layout padding already handled above with specific media queries */
                    /* transactions-card padding already handled above with specific media queries */

                    .transactions-title {
                        font-size: 1.5rem;
                    }

                    /* Button group responsiveness */
                    .button-group {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .primary-button,
                    .secondary-button {
                        max-width: 100%;
                    }

                    .completion-content {
                        padding: 2rem 1.5rem; /* Adjust padding for smaller screens */
                    }
                }

                @media (max-width: 480px) {
                    .logo-text {
                        font-size: 20px;
                    }

                    .back-button {
                        padding: 5px;
                    }

                    .back-button svg {
                        width: 20px;
                        height: 20px;
                    }

                    .back-button-text {
                        font-size: 0.9rem;
                    }
                }

                /* --- GLOBAL VARIABLES (from normalize.css or index.css) --- */
                /* These should ideally be in a global CSS file like normalize.css or index.css,
                    but are included here for completeness based on previous context. */

                /* Light Mode Specific Variables (ensure these are defined) */
                :root {
                    --background: #f4f7f6;
                    --text: #333333;
                    --text-color-light: #555555; /* Added for lighter text */
                    --card-background: #ffffff;
                    --header-text: #333333;
                    --header-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    --heading-color: #2c3e50;
                    --border: #dcdcdc;
                    --input-background-color: #ffffff;
                    --input-text-color: #333333;
                    --primary: #385a93;
                    --primary-dark: #2a416b;
                    --primary-light: rgba(56, 90, 147, 0.3);
                    --primary-light-transparent: rgba(56, 90, 147, 0.1);
                    --button-text-color: #ffffff;
                    --error-background: #ffe0e0;
                    --error-color: #cc0000;
                    --error-border: #cc0000;
                    --hover-color: rgba(0, 0, 0, 0.05);

                    --success-color: #28a745;
                    --warning-color: #ffc107;

                    --border-radius: 8px;
                    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

                    /* New Yellow Button Variables */
                    --yellow-button-bg: #ffd700; /* Gold/Yellow */
                    --yellow-button-hover-bg: #e0b800; /* Darker Yellow */
                    --yellow-button-text: #333333; /* Dark text on yellow */
                }

                /* Dark Mode Specific Variables (ensure these are defined) */
                html.dark {
                    --background: #1a1a2e;
                    --text: #e0e0e0;
                    --text-color-light: #bbbbbb; /* Added for lighter text in dark mode */
                    --card-background: #20203a;
                    --header-text: #e0e0e0;
                    --header-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
                    --heading-color: #f0f0f0;
                    --border: #3f4a6d;
                    --input-background-color: #2c3a5e;
                    --input-text-color: #e0e0e0;
                    --primary: #537fe7;
                    --primary-dark: #3b6adc;
                    --primary-light: rgba(83, 127, 231, 0.3);
                    --primary-light-transparent: rgba(83, 127, 231, 0.15);
                    --button-text-color: #ffffff;
                    --error-background: #ffe0e0;
                    --error-color: #cc0000;
                    --error-border: #cc0000;
                    --hover-color-dark: rgba(255, 255, 255, 0.1);

                    --dark-success-color: #28a745;
                    --dark-warning-color: #ffc107;

                    /* New Yellow Button Variables for Dark Mode */
                    --yellow-button-bg: #ffd700; /* Keep yellow consistent */
                    --yellow-button-hover-bg: #e0b800;
                    --yellow-button-text: #333333; /* Keep dark text consistent */
                }

                /* Specific override for the amount input in dark mode */
                html.dark .fixed-color-input {
                    background-color: #ffffff; /* Force light mode background */
                    color: #333333; /* Force light mode text color */
                }

                /* New responsive styles for transaction items (applied to transactions-list within cards) */
                .transactions-list .transaction-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: nowrap; /* Prevent wrapping on larger screens initially */
                    padding: 1rem 0;
                    border-bottom: 1px solid var(--border);
                }

                .transactions-list .transaction-item:last-child {
                    border-bottom: none;
                }

                .transactions-list .transaction-info {
                    flex-basis: 70%; /* Default for larger screens */
                    max-width: 70%;
                    display: flex;
                    flex-direction: column;
                }

                .transactions-list .transaction-amount {
                    flex-basis: 25%; /* Default for larger screens */
                    max-width: 25%;
                    text-align: right;
                    font-weight: 600;
                }

                .transactions-list .transaction-account-info {
                    margin-top: 0.25rem;
                    font-size: 0.85em;
                    color: var(--text-color-light); /* Using text-color-light for consistency */
                }

                .transactions-list .transaction-date {
                    margin-top: 0.5rem;
                    font-size: 0.9em;
                    color: var(--text-color-light); /* Using text-color-light for consistency */
                }

                /* Tablet and larger phones - 768px to 1024px */
                @media (max-width: 1024px) {
                    .transactions-list .transaction-info {
                        flex-basis: 65%;
                        max-width: 65%;
                    }
                    .transactions-list .transaction-amount {
                        flex-basis: 30%;
                        max-width: 30%;
                    }
                }

                /* Mobile phones - up to 767px (inclusive of 767px) */
                @media (max-width: 767px) {
                    .transactions-list .transaction-item {
                        flex-direction: column; /* Stack items vertically */
                        align-items: flex-start; /* Align text to the left */
                        flex-wrap: wrap; /* Allow wrapping for better fit */
                    }

                    .transactions-list .transaction-info,
                    .transactions-list .transaction-amount {
                        flex-basis: 100%; /* Take full width */
                        max-width: 100%;
                        text-align: left; /* Align text to the left for stacking */
                    }

                    .transactions-list .transaction-amount {
                        margin-top: 0.5rem; /* Add some spacing when stacked */
                    }
                }

                /* Custom styles for CustomerDashboard */
                .main-app-wrapper {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background-color: var(--background);
                    color: var(--text);
                }

                .dashboard-container {
                    padding-top: 100px; /* Offset for fixed header */
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .dashboard-main.container {
                    width: 100%;
                    max-width: 1200px; /* Match header max-width */
                    margin: 0 auto;
                    padding: 2rem 0; /* Vertical padding */
                }

                .dashboard-layout {
                    display: flex;
                    gap: 2rem;
                    width: 100%;
                    padding: 0 2rem; /* Default padding for desktop */
                }

                @media (max-width: 1440px) {
                    .dashboard-layout {
                        padding: 0 2rem;
                    }
                }

                @media (max-width: 768px) {
                    .dashboard-layout {
                        flex-direction: column;
                        padding: 0 1rem;
                    }
                }

                @media (max-width: 480px) {
                    .dashboard-layout {
                        padding: 0 0.5rem;
                    }
                }


                .sidebar {
                    flex: 0 0 250px; /* Fixed width sidebar on desktop */
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                @media (max-width: 768px) {
                    .sidebar {
                        flex: none;
                        width: 100%;
                        order: 2; /* Move sidebar below main content on mobile */
                    }
                }

                .quick-actions-card {
                    background-color: var(--card-background);
                    border-radius: var(--border-radius);
                    box-shadow: var(--box-shadow);
                    padding: 1.5rem;
                    border: 2px solid var(--border);
                }

                .quick-actions-title {
                    font-size: 1.4rem;
                    color: var(--heading-color);
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr); /* 2 columns on desktop */
                    gap: 1rem;
                }

                @media (max-width: 768px) {
                    .quick-actions-grid {
                        grid-template-columns: repeat(3, 1fr); /* 3 columns on tablet */
                    }
                }

                @media (max-width: 480px) {
                    .quick-actions-grid {
                        grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
                    }
                }

                .action-button {
                    background-color: var(--primary);
                    color: var(--button-text-color);
                    border: none;
                    border-radius: var(--border-radius);
                    padding: 1rem 0.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease, transform 0.1s ease;
                    text-align: center;
                }

                .action-button:hover {
                    background-color: var(--primary-dark);
                    transform: translateY(-2px);
                }

                .action-icon {
                    width: 24px;
                    height: 24px;
                }

                /* Hide desktop menu items on mobile and vice-versa */
                .sidebar-menu {
                    background-color: var(--card-background);
                    border-radius: var(--border-radius);
                    box-shadow: var(--box-shadow);
                    padding: 1.5rem;
                    border: 2px solid var(--border);
                }

                @media (max-width: 768px) {
                    .sidebar-menu {
                        display: none; /* Hide full sidebar menu on mobile */
                    }
                    .action-button:not(.mobile-only) {
                        display: none; /* Hide desktop quick actions on mobile */
                    }
                    .action-button.mobile-only {
                        display: flex; /* Show mobile quick actions */
                    }
                }

                @media (min-width: 769px) {
                    .sidebar-menu {
                        display: flex;
                        flex-direction: column;
                    }
                    .action-button.mobile-only {
                        display: none; /* Hide mobile quick actions on desktop */
                    }
                }


                .sidebar-menu-item {
                    background: none;
                    border: none;
                    width: 100%;
                    padding: 1rem;
                    text-align: left;
                    font-size: 1.05rem;
                    color: var(--text);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    border-radius: var(--border-radius);
                    transition: background-color 0.2s ease, color 0.2s ease;
                }

                .sidebar-menu-item:hover {
                    background-color: var(--hover-color);
                    color: var(--primary);
                }

                .sidebar-menu-item:not(:last-child) {
                    margin-bottom: 0.5rem;
                }

                .sidebar-menu-icon {
                    width: 20px;
                    height: 20px;
                    color: var(--primary);
                }


                /* Account Summary Card and Grid */
                .account-summary-card {
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark)); /* Gradient background */
                    color: #fff;
                    border-radius: var(--border-radius);
                    box-shadow: var(--box-shadow);
                    padding: 2rem;
                    margin-bottom: 2rem;
                    border: 2px solid rgba(255, 255, 255, 0.2); /* Light border */
                    width: 100%; /* Take full width of main-content */
                }

                .account-summary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap; /* Allow wrapping */
                }

                .welcome-message {
                    font-size: 1rem;
                    opacity: 0.8;
                    margin-bottom: 0.25rem;
                }

                .welcome-name {
                    font-size: 2.2rem;
                    font-weight: 700;
                    margin: 0;
                }

                .last-login {
                    font-size: 0.9rem;
                    opacity: 0.7;
                    margin-top: 0.5rem;
                }

                .view-all-button-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .view-all-button.hide-show-btn {
                    background-color: rgba(255, 255, 255, 0.2); /* Semi-transparent white */
                    color: #fff;
                    border: none;
                    border-radius: 20px; /* More rounded */
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    white-space: nowrap; /* Prevent text wrapping */
                }

                .view-all-button.hide-show-btn:hover {
                    background-color: rgba(255, 255, 255, 0.3);
                }


                .accounts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive grid */
                    gap: 1.5rem;
                }

                .account-card {
                    background-color: rgba(255, 255, 255, 0.15); /* Lighter background for account cards within summary */
                    border-radius: var(--border-radius);
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 150px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    backdrop-filter: blur(5px); /* Frosted glass effect */
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .account-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                }

                .account-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .account-type {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .account-number {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-top: 0.5rem;
                }

                .account-icon {
                    font-size: 2rem; /* Icon size for emojis */
                }

                .account-balance-section {
                    margin-top: auto; /* Push to bottom */
                }

                .account-balance {
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin-top: 0.5rem;
                }

                .available-credit {
                    font-size: 0.9rem;
                    opacity: 0.7;
                    margin-top: 0.5rem;
                }

                /* Transaction Type Indicator (CSS-driven + / -) */
                .transaction-type-indicator {
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-right: 15px;
                    flex-shrink: 0;
                    position: relative; /* For pseudo-elements */
                }

                .transaction-type-indicator.debit {
                    background-color: #fcebeb; /* Light red */
                    color: #e74c3c; /* Dark red */
                }

                .transaction-type-indicator.credit {
                    background-color: #e6faed; /* Light green */
                    color: #28a745; /* Dark green */
                }

                /* Plus/Minus signs using pseudo-elements */
                .transaction-type-indicator.debit::before {
                    content: '-';
                    font-weight: bold;
                    font-size: 1.2em;
                }

                .transaction-type-indicator.credit::before {
                    content: '+';
                    font-weight: bold;
                    font-size: 1.2em;
                }

                /* Dark mode adjustments for transaction indicators */
                html.dark .transaction-type-indicator.debit {
                    background-color: #4a2d32; /* Darker red */
                    color: #e74c3c;
                }

                html.dark .transaction-type-indicator.credit {
                    background-color: #2d4a32; /* Darker green */
                    color: #28a745;
                }

                .transaction-item {
                    display: flex;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid var(--border);
                }

                .transaction-item:last-child {
                    border-bottom: none;
                }

                .transaction-info {
                    flex-grow: 1;
                    display: flex;
                    align-items: center; /* Align icon and text vertically */
                }

                .transaction-details {
                    flex-grow: 1;
                }

                .transaction-description {
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                    font-size: 1rem;
                }

                .transaction-date {
                    font-size: 0.85rem;
                    color: var(--text-color-light);
                    margin: 0.2rem 0 0 0;
                }

                .transaction-amount {
                    font-weight: 700;
                    font-size: 1.1rem;
                    white-space: nowrap; /* Prevent amount from wrapping */
                }

                .transaction-amount.debit {
                    color: #e74c3c;
                }

                .transaction-amount.credit {
                    color: #28a745;
                }

                html.dark .transaction-amount.debit {
                    color: #e74c3c;
                }

                html.dark .transaction-amount.credit {
                    color: #28a745;
                }

                .view-all-transactions {
                    background-color: var(--primary);
                    color: var(--button-text-color);
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: var(--border-radius);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .view-all-transactions:hover {
                    background-color: var(--primary-dark);
                }

                /* Footer */
                .dashboard-footer {
                    background-color: var(--header-bg-color, #385a93); /* Match header color */
                    color: #fff;
                    padding: 1.5rem 2rem;
                    text-align: center;
                    margin-top: auto; /* Push footer to bottom */
                    width: 100%;
                }

                .footer-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .footer-copyright {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin: 0;
                }

                .footer-links {
                    display: flex;
                    gap: 1rem;
                }

                .footer-link {
                    color: #fff;
                    text-decoration: none;
                    font-size: 0.9rem;
                    opacity: 0.8;
                    transition: opacity 0.2s ease;
                }

                .footer-link:hover {
                    opacity: 1;
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .footer-content {
                        flex-direction: column;
                        text-align: center;
                    }
                    .footer-links {
                        justify-content: center;
                    }
                }
            `}</style>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <Header />

            <div className="dashboard-container">
                <div className="dashboard-main container">
                    <div className="dashboard-layout">
                        {/* Sidebar for Quick Actions and Menu */}
                        <div className="sidebar">
                            <div className="quick-actions-card quick-actions-content">
                                <h2 className="quick-actions-title">Quick Actions</h2>
                                <div className="quick-actions-grid">
                                    <button onClick={handleTransferClick} className="action-button">
                                        <DollarSign className="action-icon large-icon" size={30} />
                                        <span className="action-label">Transfer</span>
                                    </button>
                                    <button onClick={handleLoanApplyClick} className="action-button">
                                        <Banknote className="action-icon large-icon" size={30} />
                                        <span className="action-label">Loans</span>
                                    </button>
                                    <button onClick={handleCreateAccountClick} className="action-button">
                                        <PlusCircle className="action-icon large-icon" size={30} />
                                        <span className="action-label">Create Account</span>
                                    </button>
                                    {/* These mobile-only buttons currently don't navigate to new pages,
                                        so password verification might be overkill unless they perform sensitive actions.
                                        If they lead to new pages, apply the same `openVerificationModal` logic. */}
                                    <button className="action-button mobile-only">
                                        <BarChart className="action-icon large-icon" size={30} />
                                        <span className="action-label">Reports</span>
                                    </button>
                                    <button className="action-button mobile-only">
                                        <History className="action-icon large-icon" size={30} />
                                        <span className="action-label">History</span>
                                    </button>
                                    <button className="action-button mobile-only">
                                        <Settings className="action-icon large-icon" size={30} />
                                        <span className="action-label">Settings</span>
                                    </button>
                                </div>
                            </div>

                            <div className="sidebar-menu">
                                <button onClick={handleViewApplicationsClick} className="sidebar-menu-item">
                                    <BarChart className="sidebar-menu-icon" />
                                    <span>View Applications</span>
                                </button>
                                <button onClick={handleTransactionHistoryClick} className="sidebar-menu-item">
                                    <History className="sidebar-menu-icon" />
                                    <span>Transaction History</span>
                                </button>
                                <button onClick={handleAccountSettingsClick} className="sidebar-menu-item">
                                    <Settings className="sidebar-menu-icon" />
                                    <span>Account Settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="main-content">
                            <div className="account-summary-card">
                                <div className="account-summary-content">
                                    <div className="account-summary-header">
                                            <div>
                                                <p className="welcome-message">Welcome back,</p>
                                                <h2 className="welcome-name">{customerInfo.firstName}</h2>
                                            </div>
                                            <div className="view-all-button-container">
                                                <button onClick={toggleShowBalances} className="view-all-button hide-show-btn">
                                                    {showBalances ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    {showBalances ? ' Hide Balances' : ' Show Balances'}
                                                </button>
                                            </div>
                                    </div>
                                    <div>
                                        <p className="last-login">Last login: {customerInfo.lastLogin}</p>
                                    </div>

                                    <div className="accounts-grid">
                                        {accounts.length > 0 ? (
                                            accounts.map((account) => (
                                                <div
                                                    key={account.id}
                                                    className="account-card"
                                                    onClick={() => handleViewAccountDetails(account.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="account-header">
                                                        <div>
                                                            <p className="account-type">{account.type}</p>
                                                            {account.nickname && <p className="account-number">({account.nickname})</p>}
                                                            <p className="account-number">
                                                                {showBalances ? `****${account.number}` : '************'}
                                                            </p>
                                                        </div>
                                                        <span className="account-icon">
                                                            {account.type === "Credit Card" && "�"}
                                                            {account.type === "Checking Account" && "💰"}
                                                            {account.type === "Savings Account" && "🏦"}
                                                        </span>
                                                    </div>
                                                    <div className="account-balance-section">
                                                        <p className="account-type">Current Balance</p>
                                                        <p className="account-balance">
                                                            {showBalances ? (
                                                                `$${account.balance.toLocaleString("en-US", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}`
                                                            ) : (
                                                                '********'
                                                            )}
                                                        </p>
                                                        {account.type === "Credit Card" && account.limit !== null && account.limit !== undefined && (
                                                            <p className="available-credit">
                                                                {showBalances ? (
                                                                    `Available Credit: $${Math.max(0, account.limit + account.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                                ) : (
                                                                    'Available Credit: ********'
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No accounts found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="dashboard-footer">
                    <div className="footer-content">
                        <p className="footer-copyright">© 2025 Eminent Western. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#" className="footer-link">Privacy</a>
                            <a href="#" className="footer-link">Terms</a>
                            <a href="#" className="footer-link">Help</a>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Render the Password Verification Modal */}
            <Cust_Pass_Ver
                isOpen={isVerificationModalOpen}
                onClose={closeVerificationModal}
                onVerify={handlePasswordVerify}
                verificationError={verificationError} // Pass error to modal
            />
        </>
    );
}
�