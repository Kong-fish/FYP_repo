import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import { ArrowUpCircle, ArrowDownCircle, Banknote, ChevronLeft, ChevronRight } from 'lucide-react';
import './CustFunction.css';

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
    receiver_account_no: string;
    amount: number;
    purpose?: string;
    type_of_transfer: string;
    transfer_datetime: string;
}

export default function CfCustTransferHistory() {
    const navigate = useNavigate();

    const [customerAccounts, setCustomerAccounts] = useState<AccountInfo[]>([]);
    const [transactionsByAccount, setTransactionsByAccount] = useState<{ [accountId: string]: TransactionInfo[] }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentAccountIndex, setCurrentAccountIndex] = useState(0);

    useEffect(() => {
        const fetchAllAccountTransactions = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    throw new Error('No active session. Please log in.');
                }
                const userUuid = session.user.id;

                const { data: customerData, error: customerError } = await supabase
                    .from('Customer')
                    .select('customer_id')
                    .eq('user_uuid', userUuid)
                    .single();

                if (customerError || !customerData) {
                    throw new Error('Could not retrieve customer details. Please ensure your profile is complete.');
                }
                const customerId = customerData.customer_id;

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
                    return;
                }
                setCustomerAccounts(accounts as AccountInfo[]);

                const fetchedTransactions: { [accountId: string]: TransactionInfo[] } = {};
                for (const account of accounts) {
                    const { data: initiatorTransactions, error: initiatorTxError } = await supabase
                        .from('Transaction')
                        .select('*')
                        .eq('initiator_account_id', account.account_id);

                    if (initiatorTxError) {
                        console.error(`Error fetching initiator transactions for ${account.account_no}:`, initiatorTxError.message);
                    }

                    const { data: receiverTransactions, error: receiverTxError } = await supabase
                        .from('Transaction')
                        .select('*')
                        .eq('receiver_account_no', account.account_no);

                    if (receiverTxError) {
                        console.error(`Error fetching receiver transactions for ${account.account_no}:`, receiverTxError.message);
                    }

                    const allAccountTransactions: TransactionInfo[] = [];
                    if (initiatorTransactions) allAccountTransactions.push(...initiatorTransactions as TransactionInfo[]);
                    if (receiverTransactions) allAccountTransactions.push(...receiverTransactions as TransactionInfo[]);

                    allAccountTransactions.sort((a, b) => new Date(b.transfer_datetime).getTime() - new Date(a.transfer_datetime).getTime());

                    fetchedTransactions[account.account_id] = allAccountTransactions;
                }
                setTransactionsByAccount(fetchedTransactions);

            } catch (err: any) {
                console.error('Error fetching data:', err.message);
                setError(`Failed to load transaction history: ${err.message}`);
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
        if (accountNo.length === 36 && accountNo.includes('-')) {
            return `${accountNo.substring(0, 8)}...`;
        }
        return `****${accountNo.slice(-4)}`;
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    const handlePrevAccount = () => {
        setCurrentAccountIndex(prevIndex => Math.max(0, prevIndex - 1));
    };

    const handleNextAccount = () => {
        setCurrentAccountIndex(prevIndex => Math.min(customerAccounts.length - 1, prevIndex + 1));
    };

    const currentAccount = customerAccounts[currentAccountIndex];

    return (
        <div className="cf-main-app-wrapper">
            <div className="cf-cust-func-container">
                <div className="cf-cust-func-content">
                    <h2 className="cf-cust-func-card-title flex items-center">
                        <span className="flex items-center gap-2">
                            <Banknote size={24} style={{ color: 'var(--cf-blue-accent)' }} />
                            Account Transactions History
                        </span>
                    </h2>
                    <p className="cf-text-secondary cf-text-center">Review all incoming and outgoing transactions for your bank accounts.</p>

                    {loading ? (
                        <p className="cf-loading-message">Loading transaction data, please wait...</p>
                    ) : error ? (
                        <p className="cf-error-message">{error}</p>
                    ) : customerAccounts.length === 0 ? (
                        <p className="cf-no-data-message">No accounts found for your profile. Please contact support if this is incorrect.</p>
                    ) : (
                        <div className="cf-carousel-container">
                            <div
                                className="cf-carousel-wrapper"
                                style={{ transform: `translateX(-${currentAccountIndex * 100}%)` }}
                            >
                                {customerAccounts.map(account => (
                                    <div key={account.account_id} className="cf-cust-func-card cf-carousel-item">
                                        <h3 className="cf-transactions-history-title">
                                            {account.account_type} {account.nickname ? `(${account.nickname})` : ''} - {formatAccountNoDisplay(account.account_no)}
                                        </h3>
                                        <p className="cf-text-secondary cf-text-center cf-mb-4">
                                            Current Balance: ${account.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>

                                        {transactionsByAccount[account.account_id]?.length === 0 ? (
                                            <p className="cf-no-transactions-message">No transactions found for this account yet.</p>
                                        ) : (
                                            <div className="cf-scrollable-transactions"> {/* New wrapper for scroll */}
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
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Buttons */}
                            {customerAccounts.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevAccount}
                                        disabled={currentAccountIndex === 0}
                                        className="cf-carousel-nav-button cf-carousel-prev"
                                        aria-label="Previous account"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={handleNextAccount}
                                        disabled={currentAccountIndex === customerAccounts.length - 1}
                                        className="cf-carousel-nav-button cf-carousel-next"
                                        aria-label="Next account"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}