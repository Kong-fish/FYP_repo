"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Banknote, BarChart, History, Shield, Settings, PlusCircle, Eye, EyeOff } from 'lucide-react';

import '../shared/Header.css';
import '../shared/normalize.css';
import './CustomerDashboard.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';
import supabase from '../shared/supabaseClient';

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
    // State for toggling the visibility of financial balances
    const [showBalances, setShowBalances] = useState(true);

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
                    // Determine if the transaction is a debit or credit relative to the customer's perspective
                    // For simplicity, assuming if the initiator_account_id matches any of the customer's accounts, it's a debit
                    // In a more complex scenario, you might need to check if receiver_account_id is one of theirs for credits,
                    // or if there's an explicit transaction_type field.
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

    // Navigates to the detailed account page when an account card is clicked
    const handleViewAccountDetails = (accountId: string) => {
        navigate(`/customer-account-details/${accountId}`);
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
                        {/* Option to reload the page on error */}
                        <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>Reload</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-app-wrapper">
            {/* Meta viewport for responsive design */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <Header /> {/* Render the consistent header */}

            <div className="dashboard-container">
                <div className="dashboard-main container">
                    <div className="dashboard-layout">
                        {/* Sidebar for Quick Actions and Menu */}
                        <div className="sidebar">
                            {/* Quick Actions Card */}
                            <div className="quick-actions-card quick-actions-content">
                                <h2 className="quick-actions-title">Quick Actions</h2>
                                <div className="quick-actions-grid">
                                    <button onClick={() => navigate('/customer-transfer')} className="action-button">
                                        <DollarSign className="action-icon large-icon" size={30} />
                                        <span className="action-label">Transfer</span>
                                    </button>
                                    <button onClick={() => navigate('/customer-loan-apply')} className="action-button">
                                        <Banknote className="action-icon large-icon" size={30} />
                                        <span className="action-label">Loans</span>
                                    </button>
                                    {/* Changed "New Card" to "Create Account" */}
                                    <button onClick={() => navigate('/customer-new-bank-acc')} className="action-button">
                                        <PlusCircle className="action-icon large-icon" size={30} />
                                        <span className="action-label">Create Account</span>
                                    </button>
                                    {/* Mobile-only quick actions */}
                                    <button className="action-button mobile-only">
                                        <BarChart className="action-icon large-icon" size={30} />
                                        <span className="action-label">Reports</span>
                                    </button>
                                    <button className="action-button mobile-only">
                                        <History className="action-icon large-icon" size={30} />
                                        <span className="action-label">History</span>
                                    </button>
                                    <button className="action-button mobile-only">
                                        <Shield className="action-icon large-icon" size={30} />
                                        <span className="action-label">Security</span>
                                    </button>
                                    <button className="action-button mobile-only">
                                        <Settings className="action-icon large-icon" size={30} />
                                        <span className="action-label">Settings</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar Menu - Hidden on mobile, shown on larger screens */}
                            <div className="sidebar-menu">
                                <button onClick={() => navigate('/customer-view-approval')} className="sidebar-menu-item">
                                    <BarChart className="sidebar-menu-icon" />
                                    <span>View Applications</span>
                                </button>
                                <button onClick={() => navigate('/customer-transactions-history')} className="sidebar-menu-item">
                                    <History className="sidebar-menu-icon" />
                                    <span>Transaction History</span>
                                </button>
                                <button onClick={() => navigate('/customer-profile-edit')} className="sidebar-menu-item">
                                    <Settings className="sidebar-menu-icon" />
                                    <span>Account Settings</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="main-content">
                            {/* Account Summary Card */}
                            <div className="account-summary-card">
                                <div className="account-summary-content">
                                    <div className="account-summary-header">
                                            <div>
                                                <p className="welcome-message">Welcome back,</p>
                                                <h2 className="welcome-name">{customerInfo.firstName}</h2>
                                            </div>
                                            <div className="view-all-button-container">
                                                {/* Button to toggle balance visibility */}
                                                <button onClick={toggleShowBalances} className="view-all-button hide-show-btn">
                                                    {showBalances ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    {showBalances ? ' Hide Balances' : ' Show Balances'}
                                                </button>
                                                {/* "View All Accounts" button removed via CSS and not rendered here */}
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
                                                    onClick={() => handleViewAccountDetails(account.id)} // Added onClick to the div
                                                    style={{ cursor: 'pointer' }} // Add cursor style to indicate clickability
                                                >
                                                    <div className="account-header">
                                                        <div>
                                                            <p className="account-type">{account.type}</p>
                                                            {account.nickname && <p className="account-number">({account.nickname})</p>}
                                                            <p className="account-number">
                                                                {/* Mask account number based on showBalances state */}
                                                                {showBalances ? `****${account.number}` : '************'}
                                                            </p>
                                                        </div>
                                                        <span className="account-icon">
                                                            {/* Display appropriate icon based on account type */}
                                                            {account.type === "Credit Card" && "💳"}
                                                            {account.type === "Checking Account" && "💰"}
                                                            {account.type === "Savings Account" && "🏦"}
                                                        </span>
                                                    </div>
                                                    <div className="account-balance-section">
                                                        <p className="account-type">Current Balance</p>
                                                        <p className="account-balance">
                                                            {showBalances ? (
                                                                // Format balance as currency
                                                                `$${account.balance.toLocaleString("en-US", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}`
                                                            ) : (
                                                                '********' // Masked balance
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
                                                    {/* Removed the separate "View Details" button from here */}
                                                </div>
                                            ))
                                        ) : (
                                            <p>No accounts found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Transactions Card */}
                            <div className="transactions-card">
                                <div className="transactions-content">
                                    <div className="transactions-header">
                                        <h2 className="transactions-title">Recent Transactions</h2>
                                        <button className="view-all-transactions" onClick={() => navigate('/transactions')}>View All</button>
                                    </div>
                                    <div className="transactions-list">
                                        {recentTransactions.length > 0 ? (
                                            recentTransactions.map((transaction) => (
                                                <div key={transaction.id} className="transaction-item">
                                                    <div className="transaction-info">
                                                        <div className={`transaction-type-indicator ${transaction.type}`}>
                                                            {/* The actual + or - icon is now rendered purely by CSS using ::before pseudo-elements */}
                                                        </div>
                                                        <div className="transaction-details">
                                                            <p className="transaction-description">{transaction.description}</p>
                                                            <p className="transaction-date">{transaction.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`transaction-amount ${transaction.type}`}>
                                                        {showBalances ? ( // Mask transaction amounts as well
                                                            `${transaction.type === "debit" ? "-" : "+"}$${transaction.amount.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}`
                                                        ) : (
                                                            '********'
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No recent transactions found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Component */}
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
        </div>
    );
}