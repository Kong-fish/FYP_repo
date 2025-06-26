import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import { ArrowUpCircle, ArrowDownCircle, Banknote } from 'lucide-react';

import '../shared/normalize.css'; // Assuming normalize.css exists for base styles
import './CustFunction.css'; // Importing CustFunction.css for styling

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

export default function Cust_Transfer_History() {
    const navigate = useNavigate();

    const [customerAccounts, setCustomerAccounts] = useState<AccountInfo[]>([]);
    const [transactionsByAccount, setTransactionsByAccount] = useState<{ [accountId: string]: TransactionInfo[] }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllAccountTransactions = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // 1. Fetch current user's session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    throw new Error('No active session. Please log in.');
                }
                const userUuid = session.user.id;

                // 2. Get customer_id for the current user
                const { data: customerData, error: customerError } = await supabase
                    .from('Customer')
                    .select('customer_id')
                    .eq('user_uuid', userUuid)
                    .single();

                if (customerError || !customerData) {
                    throw new Error('Could not retrieve customer details. Please ensure your profile is complete.');
                }
                const customerId = customerData.customer_id;

                // 3. Fetch all accounts for this customer
                const { data: accounts, error: accountsError } = await supabase
                    .from('Account')
                    .select('account_id, account_no, account_type, balance, nickname, created_at, approved_at, account_status')
                    .eq('customer_id', customerId);

                if (accountsError) {
                    throw new Error(`Error fetching accounts: ${accountsError.message}`);
                }

                if (!accounts || accounts.length === 0) {
                    setCustomerAccounts([]);
                    setTransactionsByAccount({});
                    setLoading(false);
                    return; // No accounts, no transactions to fetch
                }
                setCustomerAccounts(accounts as AccountInfo[]);

                // 4. Fetch transactions for each account
                const fetchedTransactions: { [accountId: string]: TransactionInfo[] } = {};
                for (const account of accounts) {
                    // Fetch transactions where this account is the initiator
                    const { data: initiatorTransactions, error: initiatorTxError } = await supabase
                        .from('Transaction')
                        .select('*')
                        .eq('initiator_account_id', account.account_id);

                    if (initiatorTxError) {
                        console.error(`Error fetching initiator transactions for ${account.account_no}:`, initiatorTxError.message);
                        // Do not throw, continue to fetch receiver transactions
                    }

                    // Fetch transactions where this account is the receiver (by account_no)
                    const { data: receiverTransactions, error: receiverTxError } = await supabase
                        .from('Transaction')
                        .select('*')
                        .eq('receiver_account_no', account.account_no);

                    if (receiverTxError) {
                        console.error(`Error fetching receiver transactions for ${account.account_no}:`, receiverTxError.message);
                        // Do not throw
                    }

                    // Combine and sort transactions for the current account
                    const allAccountTransactions: TransactionInfo[] = [];
                    if (initiatorTransactions) allAccountTransactions.push(...initiatorTransactions as TransactionInfo[]);
                    if (receiverTransactions) allAccountTransactions.push(...receiverTransactions as TransactionInfo[]);

                    // Sort transactions by date (most recent first)
                    allAccountTransactions.sort((a, b) => new Date(b.transfer_datetime).getTime() - new Date(a.transfer_datetime).getTime());

                    fetchedTransactions[account.account_id] = allAccountTransactions;
                }
                setTransactionsByAccount(fetchedTransactions);

            } catch (err: any) {
                console.error('Error fetching data:', err.message);
                setError(`Failed to load transaction history: ${err.message}`);
                // Redirect if session error or customer not found
                if (err.message.includes('No active session') || err.message.includes('Could not retrieve customer details')) {
                    navigate('/customer-login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllAccountTransactions();
    }, [navigate]);

    const formatAccountNoDisplay = (accountNo: string | undefined) => {
        if (!accountNo) return 'N/A';
        // If it's a UUID (e.g., initiator_account_id for a credit transaction), show first few chars.
        // Otherwise, mask the account number.
        if (accountNo.length === 36 && accountNo.includes('-')) {
            return `${accountNo.substring(0, 8)}...`;
        }
        return `****${accountNo.slice(-4)}`;
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="cf-main-app-wrapper">
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-content"> {/* Removed inline style */}
                        <p className="cf-cust-func-loading-message">Loading transaction history...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cf-main-app-wrapper">
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-content"> {/* Removed inline style */}
                        <p className="cf-cust-func-error-message">{error}</p>
                        <button onClick={() => navigate('/customer-dashboard')} className="cf-cust-func-primary-button">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (customerAccounts.length === 0) {
        return (
            <div className="cf-main-app-wrapper">
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-content"> {/* Removed inline style */}
                        <p className="cf-no-transactions-message">No bank accounts found for this customer.</p>
                        <button onClick={() => navigate('/customer-dashboard')} className="cf-cust-func-primary-button">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cf-main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <div className="cf-cust-func-container">
                <div className="cf-cust-func-content">
                    <h2 className="cf-cust-func-card-title flex items-center">
                        <span className="flex items-center gap-2">
                             <Banknote size={24} style={{ color: 'var(--cf-blue-accent)' }} />
                             Account Transactions History
                        </span>
                    </h2>
                    <p className="cf-text-secondary cf-text-center">Review all incoming and outgoing transactions for your bank accounts.</p>

                    {customerAccounts.map(account => (
                        <div key={account.account_id} className="cf-cust-func-card mb-6">
                            <h3 className="cf-transactions-history-title">
                                {account.account_type} {account.nickname ? `(${account.nickname})` : ''} - {account.account_no}
                            </h3>
                            <p className="cf-text-secondary cf-text-center cf-mb-4">Current Balance: ${account.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

                            {transactionsByAccount[account.account_id]?.length === 0 ? (
                                <p className="cf-no-transactions-message">No transactions found for this account yet.</p>
                            ) : (
                                <div className="cf-transactions-list">
                                    {transactionsByAccount[account.account_id]?.map(tx => {
                                        const isDebit = tx.initiator_account_id === account.account_id;
                                        const transactionTypeClass = isDebit ? 'cf-transaction-type-debit' : 'cf-transaction-type-credit';
                                        const icon = isDebit ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />;

                                        return (
                                            <div key={tx.transaction_id} className={`cf-transaction-item ${transactionTypeClass}`}>
                                                <div className="cf-transaction-icon">{icon}</div>
                                                <div className="cf-transaction-details">
                                                    <p className="cf-transaction-amount">
                                                        {isDebit ? '-' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="cf-transaction-info">
                                                        {isDebit ? (
                                                            <>Transfer to: <strong>{formatAccountNoDisplay(tx.receiver_account_no)}</strong></>
                                                        ) : (
                                                            <>Transfer from: <strong>{formatAccountNoDisplay(tx.initiator_account_id)}</strong></>
                                                        )}
                                                    </p>
                                                    <p className="cf-transaction-purpose">{tx.purpose || 'No purpose provided'}</p>
                                                </div>
                                                <div className="cf-transaction-meta">
                                                    <span className="cf-transaction-date">{formatDate(tx.transfer_datetime)}</span>
                                                    <span className="cf-transaction-type">{tx.type_of_transfer}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}