// Customer_Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import './CustomerDashboard.css'; // Main dashboard specific styles
import '../shared/normalize.css'; // Global normalize styles
import '../shared/Header.css'; // Import Header specific styles

// Import the DarkModeToggle, as it's now used directly within this file's Header
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

// Import Lucide icons for consistency and better styling
import { DollarSign, Banknote, PlusCircle, BarChart, History, Settings, Eye, EyeOff, CreditCard, Landmark, PiggyBank } from 'lucide-react';
import Cust_Pass_Ver from '../Cust_Function/Cust_Pass_Ver.tsx'; // Assuming this component exists

// The Header component as provided by the user, now with sign-out functionality
const Header = () => {
    const navigate = useNavigate(); // useNavigate hook must be inside a component

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/customer-landing'); // Redirect to landing page after sign out
        }
    };

    return (
        <header className="header">
            <div className="header__content">
                <div className="logo-section">
                    <span className="logo-text header__title">Eminent Western</span>
                </div>
                <div className="header-actions"> {/* This div groups DarkModeToggle and Sign Out */}
                    <DarkModeToggle />
                    <button onClick={handleSignOut} className="sign-out-button header-sign-out-btn">
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};

interface CustomerInfo {
    id: string | null; // Corresponds to customer_id
    firstName: string;
    lastName: string;
    lastLogin: string; // Formatted last sign-in time
}

interface Account {
    id: string; // Corresponds to account_id
    type: string; // Corresponds to account_type
    number: string; // Corresponds to account_no
    balance: number;
    nickname: string | null; // Corresponds to nickname
}

interface Transaction {
    id: string; // Corresponds to transaction_id
    description: string; // Corresponds to purpose
    amount: number;
    date: string; // Corresponds to transfer_datetime (formatted)
    type: 'debit' | 'credit'; // Derived based on transaction direction (initiator_account_id, receiver_account_no)
}


export default function CustomerDashboard() {
    const navigate = useNavigate();
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        id: null,
        firstName: '',
        lastName: '',
        lastLogin: 'N/A',
    });
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [showBalances, setShowBalances] = useState(false); // Balances hidden by default
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [actionToPerform, setActionToPerform] = useState<(() => void) | null>(null);
    const [verificationError, setVerificationError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);

    // --- Function to fetch customer profile and session data ---
    useEffect(() => {
        const getCustomerSessionAndProfile = async () => {
            setIsLoading(true);
            setDataError(null);

            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Error getting session:', sessionError.message);
                setDataError('Failed to load user session. Please try again.');
                navigate('/customer-landing'); // Redirect to landing page if session fails
                setIsLoading(false);
                return;
            }

            if (!sessionData?.session) {
                navigate('/customer-landing'); // Redirect if no active session
                setIsLoading(false);
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
                setDataError('Failed to load customer profile.');
                setCustomerInfo(prev => ({
                    ...prev,
                    lastLogin: lastSignInAt ? new Date(lastSignInAt).toLocaleString() : 'N/A'
                }));
                setIsLoading(false);
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
                setDataError('Customer profile not found.');
                navigate('/customer-landing'); // Redirect if customer profile is not found
            }
            setIsLoading(false);
        };

        getCustomerSessionAndProfile();

        // Listen for authentication state changes and re-fetch profile/accounts if state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                // Clear customer data if logged out
                setCustomerInfo({ id: null, firstName: '', lastName: '', lastLogin: 'N/A' });
                setAccounts([]);
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


    // --- Function to fetch accounts once customerInfo.id is available ---
    // This useEffect was commented out and is now restored.
    useEffect(() => {
        const fetchAccounts = async () => {
            if (!customerInfo.id) {
                // Do not fetch if customer ID is not yet available
                setAccounts([]);
                return;
            }
            setIsLoading(true);
            setDataError(null);

            // Fetch accounts associated with the customer_id
            const { data: accountsData, error: accountsError } = await supabase
                .from('Account')
                .select('account_id, account_no, account_type, balance, nickname')
                .eq('customer_id', customerInfo.id)
                .order('created_at', { ascending: true }); // Order accounts by creation date

            if (accountsError) {
                console.error('Error fetching accounts:', accountsError.message);
                setDataError('Failed to load bank accounts.');
                setAccounts([]);
            } else {
                // Format account data for display, masking account numbers
                const formattedAccounts: Account[] = accountsData.map(acc => ({
                    id: acc.account_id,
                    type: acc.account_type,
                    number: acc.account_no,
                    balance: acc.balance,
                    nickname: acc.nickname,
                }));
                setAccounts(formattedAccounts);
            }
            setIsLoading(false);
        };

        fetchAccounts();
    }, [customerInfo.id]); // Rerun effect when customerInfo.id changes


    // Toggles the visibility of financial balances
    const toggleShowBalances = () => {
        setShowBalances(prev => !prev);
    };

    // --- Functions for password verification workflow ---
    const openVerificationModal = (action: () => void) => {
        setActionToPerform(() => action);
        setIsVerificationModalOpen(true);
        setVerificationError('');
    };

    const closeVerificationModal = () => {
        setIsVerificationModalOpen(false);
        setActionToPerform(null);
        setVerificationError('');
    };

    const handlePasswordVerify = async (password: string) => {
        const user = (await supabase.auth.getUser()).data.user;

        if (!user || !user.email) {
            setVerificationError('User email not found for verification.');
            return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password,
        });

        if (!signInError) {
            setVerificationError('');
            closeVerificationModal();
            if (actionToPerform) {
                actionToPerform();
            }
        } else {
            console.error('Password verification failed:', signInError.message);
            if (signInError.message.includes("Invalid login credentials")) {
                setVerificationError('Incorrect password. Please try again.');
            } else {
                setVerificationError(`Verification failed: ${signInError.message}`);
            }
        }
    };

    // All button click handlers now use the verification modal
    const handleTransferClick = () => {
        openVerificationModal(() => navigate('/customer-transfer'));
    };

    const handleLoanApplyClick = () => {
        openVerificationModal(() => navigate('/customer-loan-apply'));
    };

    const handleCreateAccountClick = () => {
        openVerificationModal(() => navigate('/customer-new-bank-acc'));
    };

    const handleViewApplicationsClick = () => {
        openVerificationModal(() => navigate('/customer-view-approval'));
    };

    const handleTransactionHistoryClick = () => {
        openVerificationModal(() => navigate('/customer-transactions-history'));
    };

    const handleAccountSettingsClick = () => {
        openVerificationModal(() => navigate('/customer-profile-edit'));
    };

    const handleViewAccountDetails = (accountId: string) => {
        openVerificationModal(() => navigate(`/customer-account-details/${accountId}`));
    };

    const handleReportsClick = () => {
        openVerificationModal(() => navigate('/reports')); // Example navigation
    };

    const handleHistoryMobileClick = () => {
        openVerificationModal(() => navigate('/customer-transactions-history'));
    };

    const handleSettingsMobileClick = () => {
        openVerificationModal(() => navigate('/customer-profile-edit'));
    };

    const handleAccountCardClick = (accountId: string) => {
  navigate(`/customer-account-details/${accountId}`);
};


    if (isLoading) {
        return (
            <div className="dashboard-container loading-state"> {/* Added loading-state class for dedicated styling */}
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="dashboard-container error-state"> {/* Added error-state class for dedicated styling */}
                <p className="error-message">{dataError}</p>
                <button onClick={() => window.location.reload()} className="reload-button">Reload</button>
            </div>
        );
    }

    return (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* The Header component is now defined directly in this file */}
            <Header />

            <div className="dashboard-container">
                <div className="dashboard-main container">
                    {/* The dashboard-layout manages the left/right sections */}
                    <div className="dashboard-layout">
                        {/* Sidebar for Quick Actions and Menu (Left Side) */}
                        <div className="sidebar">
                            <div className="quick-actions-card quick-actions-content">
                                <h2 className="quick-actions-title">Quick Actions</h2>
                                <div className="quick-actions-grid">
                                    <button onClick={handleTransferClick} className="action-button">
                                        <DollarSign className="action-icon" size={30} />
                                        <span className="action-label">Transfer</span>
                                    </button>
                                    <button onClick={handleLoanApplyClick} className="action-button">
                                        <Banknote className="action-icon" size={30} />
                                        <span className="action-label">Loans</span>
                                    </button>
                                    <button onClick={handleCreateAccountClick} className="action-button">
                                        <PlusCircle className="action-icon" size={30} />
                                        <span className="action-label">Create Account</span>
                                    </button>
                                    {/* These mobile-only buttons now also trigger verification */}
                                    <button onClick={handleReportsClick} className="action-button mobile-only">
                                        <BarChart className="action-icon" size={30} />
                                        <span className="action-label">Reports</span>
                                    </button>
                                    <button onClick={handleHistoryMobileClick} className="action-button mobile-only">
                                        <History className="action-icon" size={30} />
                                        <span className="action-label">History</span>
                                    </button>
                                    <button onClick={handleSettingsMobileClick} className="action-button mobile-only">
                                        <Settings className="action-icon" size={30} />
                                        <span className="action-label">Settings</span>
                                    </button>
                                </div>
                            </div>

                            <div className="sidebar-menu">
                                <button onClick={handleViewApplicationsClick} className="sidebar-menu-item">
                                    <BarChart className="sidebar-menu-icon" size={20} /> {/* Added size for consistency */}
                                    <span>View Applications</span>
                                </button>
                                <button onClick={handleTransactionHistoryClick} className="sidebar-menu-item">
                                    <History className="sidebar-menu-icon" size={20} />
                                    <span>Transaction History</span>
                                </button>
                                <button onClick={handleAccountSettingsClick} className="sidebar-menu-item">
                                    <Settings className="sidebar-menu-icon" size={20} />
                                    <span>Account Settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area (Right Side) */}
                        <div className="main-content">
                            <div className="account-summary-card">
                                <div className="account-summary-content">
                                    <div className="account-summary-header">
                                        <div>
                                            <p className="welcome-message">Welcome back,</p>
                                            <h2 className="welcome-name">
                                                {customerInfo.firstName} {customerInfo.lastName}
                                            </h2>
                                        </div>
                                        <div className="view-all-button-container">
                                            <button onClick={toggleShowBalances} className="view-all-button hide-show-btn">
                                                {showBalances ? <EyeOff size={20} /> : <Eye size={20} />}
                                                {showBalances ? ' Hide Balances' : ' Show Balances'}
                                            </button>
                                            <button className="view-all-button" onClick={handleViewAllAccountsClick}>
                                                View All Accounts
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
                                                >
                                                    <div className="account-header">
                                                        <div>
                                                            <p className="account-type">{account.type}</p>
                                                            {account.nickname && <p className="account-number">({account.nickname})</p>}
                                                            <p className="account-number">
                                                                {showBalances ? `****${account.number.slice(-4)}` : '************'}
                                                            </p>
                                                        </div>
                                                        <span className="account-icon">
                                                            {/* Replaced emojis with Lucide icons */}
                                                            {account.type === "Credit Card" && <CreditCard size={28} />}
                                                            {account.type === "Checking Account" && <Landmark size={28} />} {/* Changed to Landmark for checking */}
                                                            {account.type === "Savings Account" && <PiggyBank size={28} />} {/* Changed to PiggyBank for savings */}
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
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-accounts-message">No accounts found. Create one to get started!</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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

            {/* Render the Password Verification Modal */}
            <Cust_Pass_Ver
                isOpen={isVerificationModalOpen}
                onClose={closeVerificationModal}
                onVerify={handlePasswordVerify}
                verificationError={verificationError}
            />
        </>
    );
}
