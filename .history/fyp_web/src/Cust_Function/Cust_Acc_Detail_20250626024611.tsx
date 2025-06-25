// src/Cust_Function/Cust_Account_Details.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'; // Icons for transactions

import '../shared/Header.css';
import '../shared/normalize.css';
import './CustFunction.css'; // Reusing general customer function styles
import  '../shared/Header.tsx'; // Import the shared Header component

// Interface for account information
interface AccountInfo {
    account_id: string;
    account_no: string;
    account_type: string;
    balance: number;
    nickname?: string;
    created_at: string;
    approved_at?: string;
    account_status: string;
}

// Interface for transaction information
interface TransactionInfo {
    transaction_id: string;
    initiator_account_id: string;
    receiver_account_no: string; // The account number of the receiver
    amount: number;
    purpose?: string;
    type_of_transfer: string;
    transfer_datetime: string;
}

export default function Cust_Acc_Details() {
    const { accountId } = useParams<{ accountId: string }>(); // Get accountId from URL
    const navigate = useNavigate();

    const [accountDetails, setAccountDetails] = useState<AccountInfo | null>(null);
    const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccountAndTransactions = async () => {
            setLoading(true);
            setError(null);

            if (!accountId) {
                setError("Account ID is missing. Please select an account from the dashboard.");
                setLoading(false);
                return;
            }

            try {
                // Fetch current user's session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    throw new Error('No active session. Please log in.');
                }
                const userUuid = session.user.id;

                // Get customer_id for the current user
                const { data: customerData, error: customerError } = await supabase
                    .from('Customer')
                    .select('customer_id')
                    .eq('user_uuid', userUuid)
                    .single();

                if (customerError || !customerData) {
                    throw new Error('Could not retrieve customer details.');
                }
                const customerId = customerData.customer_id;

                // Fetch account details for the given accountId, ensuring it belongs to the current customer
                const { data: accountData, error: accountError } = await supabase
                    .from('Account')
                    .select('account_id, account_no, account_type, balance, nickname, created_at, approved_at, account_status')
                    .eq('account_id', accountId)
                    .eq('customer_id', customerId) // Ensure account belongs to the logged-in customer
                    .single();

                if (accountError || !accountData) {
                    // If account doesn't exist or doesn't belong to the user
                    throw new Error(`Account not found or you do not have access: ${accountError?.message || 'Unknown error'}`);
                }
                setAccountDetails(accountData as AccountInfo);

                // Fetch transactions where this account is either the initiator or the receiver
                const { data: initiatorTransactions, error: initiatorTxError } = await supabase
                    .from('Transaction')
                    .select('*')
                    .eq('initiator_account_id', accountId);

                if (initiatorTxError) {
                    console.error('Error fetching initiator transactions:', initiatorTxError.message);
                    // Don't throw, just log and continue, as recipient transactions might still load
                }

                const { data: receiverTransactions, error: receiverTxError } = await supabase
                    .from('Transaction')
                    .select('*')
                    .eq('receiver_account_no', accountData.account_no); // Match by account_no for receiver

                if (receiverTxError) {
                    console.error('Error fetching receiver transactions:', receiverTxError.message);
                }

                // Combine and sort transactions by date (most recent first)
                const allTransactions: TransactionInfo[] = [];
                if (initiatorTransactions) allTransactions.push(...initiatorTransactions as TransactionInfo[]);
                if (receiverTransactions) allTransactions.push(...receiverTransactions as TransactionInfo[]);

                allTransactions.sort((a, b) => new Date(b.transfer_datetime).getTime() - new Date(a.transfer_datetime).getTime());

                setTransactions(allTransactions);

            } catch (err: any) {
                console.error('Error fetching account details or transactions:', err.message);
                setError(`Failed to load account details: ${err.message}`);
                // Redirect to dashboard if account not found or access denied
                if (err.message.includes('Account not found') || err.message.includes('No active session')) {
                    navigate('/customer-dashboard');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAccountAndTransactions();
    }, [accountId, navigate]); // Rerun when accountId changes

    const formatAccountNoDisplay = (accountNo: string | undefined) => {
        if (!accountNo) return 'N/A';
        return `****${accountNo.slice(-4)}`;
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="main-app-wrapper">
                {/* Pass showBackButton and handleBack to the shared Header */}
                <Header showBackButton={true} handleBack={() => navigate("/customer-dashboard")} />
                <div className="cust-func-container">
                    <div className="cust-func-content" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="cust-func-loading-message">Loading account details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-app-wrapper">
                {/* Pass showBackButton and handleBack to the shared Header */}
                <Header showBackButton={true} handleBack={() => navigate("/customer-dashboard")} />
                <div className="cust-func-container">
                    <div className="cust-func-content" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="cust-func-error-message">{error}</p>
                        <button onClick={() => navigate('/customer-dashboard')} className="cust-func-primary-button">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!accountDetails) {
        // This case should ideally be caught by the error handler above, but as a fallback
        return (
            <div className="main-app-wrapper">
                {/* Pass showBackButton and handleBack to the shared Header */}
                <Header showBackButton={true} handleBack={() => navigate("/customer-dashboard")} />
                <div className="cust-func-container">
                    <div className="cust-func-content" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="cust-func-error-message">Account details could not be loaded.</p>
                        <button onClick={() => navigate('/customer-dashboard')} className="cust-func-primary-button">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            {/* Pass showBackButton and handleBack to the shared Header */}
            <Header showBackButton={true} handleBack={() => navigate("/customer-dashboard")} />
            <div className="cust-func-container">
                <div className="cust-func-content">
                    <div className="cust-func-card">
                        <div className="cust-func-card-header">
                            <h2 className="cust-func-card-title">Account Details</h2>
                        </div>

                        <div className="account-details-section cust-func-confirmation-details"> {/* Reusing confirmation details styles */}
                            <p><strong>Account Type:</strong> {accountDetails.account_type} {accountDetails.nickname ? `(${accountDetails.nickname})` : ''}</p>
                            <p><strong>Account Number:</strong> {accountDetails.account_no}</p>
                            <p><strong>Current Balance:</strong> ${accountDetails.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p><strong>Account Status:</strong> {accountDetails.account_status}</p>
                            <p><strong>Opened On:</strong> {formatDate(accountDetails.created_at)}</p>
                            {accountDetails.approved_at && <p><strong>Approved On:</strong> {formatDate(accountDetails.approved_at)}</p>}
                        </div>

                        <div className="transaction-history-section">
                            <h3 className="transactions-history-title">Transaction History</h3>
                            {transactions.length === 0 ? (
                                <p className="no-transactions-message">No transactions found for this account.</p>
                            ) : (
                                <div className="transactions-list">
                                    {transactions.map(tx => {
                                        const isDebit = tx.initiator_account_id === accountId;
                                        const transactionTypeClass = isDebit ? 'transaction-type-debit' : 'transaction-type-credit';
                                        const icon = isDebit ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />;
                                        // To display initiator's actual account_no if it's a credit, you'd need to fetch it separately for each transaction
                                        // For simplicity, showing initiator_account_id if it's a credit.
                                        // A more robust solution would join with Account table or store both numbers in Transaction.

                                        return (
                                            <div key={tx.transaction_id} className={`transaction-item ${transactionTypeClass}`}>
                                                <div className="transaction-icon">{icon}</div>
                                                <div className="transaction-details">
                                                    <p className="transaction-amount">${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    <p className="transaction-info">
                                                        {isDebit ? (
                                                            <>Transfer to: <strong>{formatAccountNoDisplay(tx.receiver_account_no)}</strong></>
                                                        ) : (
                                                            // Note: tx.initiator_account_id is a UUID here.
                                                            // To show an account number, you'd need to map it to the actual account_no.
                                                            // For now, it shows the masked UUID.
                                                            <>Transfer from: <strong>{formatAccountNoDisplay(tx.initiator_account_id)}</strong></>
                                                        )}
                                                    </p>
                                                    <p className="transaction-purpose">{tx.purpose || 'N/A'}</p>
                                                </div>
                                                <div className="transaction-meta">
                                                    <span className="transaction-date">{formatDate(tx.transfer_datetime)}</span>
                                                    <span className="transaction-type">{tx.type_of_transfer}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="cust-func-button-group">
                            <button onClick={() => navigate('/customer-dashboard')} className="cust-func-primary-button">
                                Back to Dashboard
                            </button>
                        </div>
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
        </div>
    );
}
