"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import { ArrowLeft } from 'lucide-react'; // Only ArrowLeft is needed here, Eye/EyeOff removed

import '../shared/Header.css';
import '../shared/normalize.css';
import './Cust_Function.css'; // Reusing general customer function styles for card, form elements etc.
import './CustomerDashboard.css'; // Reusing dashboard specific styles for overall layout, account cards etc.
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

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
                    <span className="logo-icon">🏦</span> {/* Icon for the logo */}
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

// Interface for Account details
interface AccountDetail {
    account_id: string;
    account_no: string; // Full account number
    account_type: string;
    balance: number;
    nickname?: string;
    created_at?: string;
    customer_id?: string;
    limit?: number; // For credit cards
}

// Interface for Transaction details
interface TransactionDetail {
    transaction_id: string;
    initiator_account_id: string; // ID of the account that initiated the transaction
    receiver_account_no: string; // Account number of the receiving party
    amount: number;
    purpose: string;
    transfer_datetime: string;
    type: 'debit' | 'credit'; // Derived for display
}


export default function Cust_Acc_Detail() {
    const navigate = useNavigate();
    const { accountId } = useParams<{ accountId: string }>(); // Get accountId from URL parameters

    const [account, setAccount] = useState<AccountDetail | null>(null);
    const [transactions, setTransactions] = useState<TransactionDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // showBalances state and its toggle function are intentionally REMOVED from this component

    useEffect(() => {
        const fetchAccountDetailsAndTransactions = async () => {
            if (!accountId) {
                setError("Account ID is missing.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Verify user session and get customer_id
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !sessionData?.session) {
                    throw new Error('No active session. Please log in.');
                }
                const userUuid = sessionData.session.user.id;

                const { data: customerData, error: customerError } = await supabase
                    .from('Customer')
                    .select('customer_id')
                    .eq('user_uuid', userUuid)
                    .single();

                if (customerError || !customerData) {
                    throw new Error('Could not retrieve customer details.');
                }
                const customerId = customerData.customer_id;

                // Fetch specific account details including the full account_no
                const { data: accountData, error: accountError } = await supabase
                    .from('Account')
                    .select('account_id, account_no, account_type, balance, nickname, created_at, customer_id')
                    .eq('account_id', accountId)
                    .single();

                if (accountError || !accountData) {
                    throw new Error('Account not found or inaccessible.');
                }

                // IMPORTANT: Verify that the fetched account belongs to the current customer
                if (accountData.customer_id !== customerId) {
                    throw new Error('Unauthorized access to account details.');
                }

                // Set a placeholder limit for credit cards if not explicitly in DB
                const formattedAccount: AccountDetail = {
                    ...accountData,
                    limit: accountData.account_type === 'Credit Card' ? 5000 : undefined // Default limit
                };
                setAccount(formattedAccount);
                console.log("Fetched Account Data:", formattedAccount); // Log fetched account data

                // --- Fetch transactions where this account is the initiator (debit) ---
                const { data: debitTransactionsData, error: debitTransactionsError } = await supabase
                    .from('Transaction')
                    .select('transaction_id, initiator_account_id, receiver_account_no, amount, purpose, transfer_datetime, type_of_transfer')
                    .eq('initiator_account_id', accountId)
                    .order('transfer_datetime', { ascending: false });

                if (debitTransactionsError) {
                    console.error('Error fetching debit transactions:', debitTransactionsError.message);
                    throw new Error(`Failed to load debit transaction history: ${debitTransactionsError.message}`);
                }

                // --- Fetch transactions where this account is the receiver (credit) ---
                const { data: creditTransactionsData, error: creditTransactionsError } = await supabase
                    .from('Transaction')
                    .select('transaction_id, initiator_account_id, receiver_account_no, amount, purpose, transfer_datetime, type_of_transfer')
                    .eq('receiver_account_no', accountData.account_no) // Using the full account number for receiver
                    .order('transfer_datetime', { ascending: false });

                if (creditTransactionsError) {
                    console.error('Error fetching credit transactions:', creditTransactionsError.message);
                    throw new Error(`Failed to load credit transaction history: ${creditTransactionsError.message}`);
                }

                // Combine and format transactions
                const combinedTransactions = [...debitTransactionsData, ...creditTransactionsData];

                // Sort combined transactions by date (descending)
                combinedTransactions.sort((a, b) => new Date(b.transfer_datetime).getTime() - new Date(a.transfer_datetime).getTime());

                const formattedTransactions: TransactionDetail[] = combinedTransactions.map(trans => {
                    const isDebit = trans.initiator_account_id === accountId; // If this account is the initiator, it's a debit
                    return {
                        transaction_id: trans.transaction_id,
                        initiator_account_id: trans.initiator_account_id,
                        receiver_account_no: trans.receiver_account_no,
                        amount: Math.abs(trans.amount),
                        purpose: trans.purpose || 'General Transaction',
                        transfer_datetime: trans.transfer_datetime ? new Date(trans.transfer_datetime).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'N/A',
                        type: isDebit ? 'debit' : 'credit',
                    };
                });
                setTransactions(formattedTransactions);
                console.log("Fetched Transactions Data:", formattedTransactions); // Log fetched transactions

            } catch (err: any) {
                console.error('Error fetching account details or transactions:', err.message);
                setError(`Error: ${err.message}`);
                if (err.message.includes('No active session') || err.message.includes('Unauthorized')) {
                    navigate('/customer-landing'); // Redirect if not logged in or unauthorized
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAccountDetailsAndTransactions();
    }, [accountId, navigate]); // Rerun effect if accountId changes or navigate function changes


    // No toggleShowBalances function here

    if (loading) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="dashboard-container">
                    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="loading-message">Loading account details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="dashboard-container">
                    <div className="container" style={{ padding: '2rem', textAlign: 'center', color: 'var(--error-color)' }}>
                        <p>{error}</p>
                        <button onClick={() => navigate('/customer-dashboard')} className="secondary-button" style={{ marginTop: '1rem' }}>
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!account) {
        // This case should ideally be caught by the error state above if account is not found,
        // but included as a fallback for clarity.
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="dashboard-container">
                    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Account details not available.</p>
                        <button onClick={() => navigate('/customer-dashboard')} className="secondary-button" style={{ marginTop: '1rem' }}>
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <Header />
            <div className="dashboard-container">
                <div className="dashboard-main container">
                    <div className="dashboard-layout">
                        {/* Main Content Area */}
                        <div className="main-content full-width-on-mobile"> {/* Added class for mobile responsiveness */}
                            {/* Account Details Card */}
                            <div className="account-summary-card transactions-card"> {/* Reusing card styles */}
                                <div className="account-summary-content transactions-content">
                                    <div className="account-summary-header transactions-header">
                                        <h2 className="welcome-title transactions-title">Account Details</h2>
                                        {/* Removed hide/show balances button completely */}
                                    </div>

                                    {/* Display Account Details */}
                                    {/* Made the section display as flex for horizontal layout */}
                                    <div className="account-details-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
                                        <div className="detail-item" style={{display: 'flex', flexDirection: 'column', minWidth: '48%', marginBottom: '0.5rem'}}>
                                            <span className="detail-label" style={{fontWeight: '600', color: 'var(--heading-color)', marginBottom: '0.25rem'}}>Account Type:</span>
                                            <span className="detail-value" style={{color: 'var(--text)'}}>{account.account_type || 'N/A'}</span>
                                        </div>
                                        {account.nickname && (
                                            <div className="detail-item" style={{display: 'flex', flexDirection: 'column', minWidth: '48%', marginBottom: '0.5rem'}}>
                                                <span className="detail-label" style={{fontWeight: '600', color: 'var(--heading-color)', marginBottom: '0.25rem'}}>Nickname:</span>
                                                <span className="detail-value" style={{color: 'var(--text)'}}>{account.nickname}</span>
                                            </div>
                                        )}
                                        <div className="detail-item" style={{display: 'flex', flexDirection: 'column', minWidth: '48%', marginBottom: '0.5rem'}}>
                                            <span className="detail-label" style={{fontWeight: '600', color: 'var(--heading-color)', marginBottom: '0.25rem'}}>Account Number:</span>
                                            <span className="detail-value" style={{color: 'var(--text)'}}>{account.account_no || 'N/A'}</span>
                                        </div>
                                        <div className="detail-item" style={{display: 'flex', flexDirection: 'column', minWidth: '48%', marginBottom: '0.5rem'}}>
                                            <span className="detail-label" style={{fontWeight: '600', color: 'var(--heading-color)', marginBottom: '0.25rem'}}>Current Balance:</span>
                                            <span className="detail-value account-balance-text" style={{color: 'var(--text)'}}>
                                                ${(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {account.account_type === 'Credit Card' && account.limit !== undefined && (
                                            <div className="detail-item" style={{display: 'flex', flexDirection: 'column', minWidth: '48%', marginBottom: '0.5rem'}}>
                                                <span className="detail-label" style={{fontWeight: '600', color: 'var(--heading-color)', marginBottom: '0.25rem'}}>Credit Limit:</span>
                                                <span className="detail-value account-balance-text" style={{color: 'var(--text)'}}>
                                                    ${(account.limit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        {account.account_type === 'Credit Card' && account.limit !== undefined && (
                                            <div className="detail-item" style={{display: 'flex', flexDirection: 'column', minWidth: '48%', marginBottom: '0.5rem'}}>
                                                <span className="detail-label" style={{fontWeight: '600', color: 'var(--heading-color)', marginBottom: '0.25rem'}}>Available Credit:</span>
                                                <span className="detail-value account-balance-text" style={{color: 'var(--text)'}}>
                                                    ${Math.max(0, (account.limit || 0) + (account.balance || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        <div className="detail-item" style={{display: 'flex', flexDirection: 'column', minWidth: '48%', marginBottom: '0.5rem'}}>
                                            <span className="detail-label" style={{fontWeight: '600', color: 'var(--heading-color)', marginBottom: '0.25rem'}}>Account Opened:</span>
                                            <span className="detail-value" style={{color: 'var(--text)'}}>{account.created_at ? new Date(account.created_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction History for this Account */}
                            <div className="transactions-card" style={{ marginTop: '2rem' }}>
                                <div className="transactions-content">
                                    <div className="transactions-header">
                                        <h2 className="transactions-title">Transaction History</h2>
                                    </div>
                                    <div className="transactions-list">
                                        {transactions.length > 0 ? (
                                            transactions.map((transaction) => (
                                                <div key={transaction.transaction_id} className="transaction-item">
                                                    <div className="transaction-info">
                                                        <div className={`transaction-type-indicator ${transaction.type}`}>
                                                            {transaction.type === "credit" ? "+" : "-"}
                                                        </div>
                                                        <div className="transaction-details">
                                                            <p className="transaction-purpose">{transaction.purpose}</p>
                                                            <p className="transaction-date">{transaction.transfer_datetime}</p>
                                                            <p className="transaction-account-info">
                                                                {/* Display sender/receiver info based on transaction type */}
                                                                {transaction.type === 'debit' ? (
                                                                    `To: ${transaction.receiver_account_no || 'N/A'}`
                                                                ) : (
                                                                    `From Account: ${transaction.initiator_account_id || 'N/A'}`
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`transaction-amount ${transaction.type}`}>
                                                        {/* Always show transaction amount */}
                                                        {`${transaction.type === "debit" ? "-" : "+"}${(transaction.amount || 0).toLocaleString("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No transactions found for this account.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
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
