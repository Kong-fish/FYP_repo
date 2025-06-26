import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import { ArrowUpCircle, ArrowDownCircle, Banknote, ChevronLeft, ChevronRight } from 'lucide-react';

// Removed external CSS imports due to compilation errors
// import '../shared/normalize.css';
// import './CustFunction.css';

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
    const [currentAccountIndex, setCurrentAccountIndex] = useState(0); // State to manage current account in carousel

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
                    }

                    // Fetch transactions where this account is the receiver (by account_no)
                    const { data: receiverTransactions, error: receiverTxError } = await supabase
                        .from('Transaction')
                        .select('*')
                        .eq('receiver_account_no', account.account_no);

                    if (receiverTxError) {
                        console.error(`Error fetching receiver transactions for ${account.account_no}:`, receiverTxError.message);
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

    if (loading) {
        return (
            <div className="cf-main-app-wrapper">
                {/* Inlined CSS for consistent styling */}
                <style>
                {`
                    :root {
                        --cf-bg-primary: #f8f9fa;
                        --cf-bg-secondary: #fff;
                        --cf-text-primary: #333;
                        --cf-text-secondary: #666;
                        --cf-text-light: #888;
                        --cf-card-border: #e0e0e0;
                        --cf-box-shadow-light: rgba(0, 0, 0, 0.05);
                        --cf-box-shadow-medium: rgba(0, 0, 0, 0.1);

                        --cf-blue-accent: #007bff;
                        --cf-blue-accent-hover: #0056b3;
                        --cf-blue-accent-rgb: 0, 123, 255;

                        --cf-green-success: #28a745;
                        --cf-green-success-rgb: 40, 167, 69;

                        --cf-red-error: #dc3545;
                        --cf-red-error-rgb: 220, 53, 69;

                        --cf-disabled-input-bg: #e9ecef;

                        --cf-modal-overlay-bg: rgba(0, 0, 0, 0.6);
                        --cf-modal-bg: var(--cf-bg-secondary);
                        --cf-modal-border: var(--cf-card-border);
                        --cf-modal-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
                        --cf-modal-text: var(--cf-text-primary);
                        --cf-modal-text-secondary: var(--cf-text-secondary);
                    }

                    body.dark-mode {
                        --cf-bg-primary: #2d2d2d;
                        --cf-bg-secondary: #1a1a1a;
                        --cf-text-primary: #e0e0e0;
                        --cf-text-secondary: #b0b0b0;
                        --cf-text-light: #999;
                        --cf-card-border: #444;
                        --cf-box-shadow-light: rgba(255, 255, 255, 0.05);
                        --cf-box-shadow-medium: rgba(255, 255, 255, 0.1);

                        --cf-blue-accent: #5b9bd5;
                        --cf-blue-accent-hover: #3a7bbd;
                        --cf-blue-accent-rgb: 91, 155, 213;

                        --cf-green-success: #4CAF50;
                        --cf-green-success-rgb: 76, 175, 80;

                        --cf-red-error: #EF5350;
                        --cf-red-error-rgb: 239, 83, 80;

                        --cf-disabled-input-bg: #3c3c3c;

                        --cf-modal-overlay-bg: rgba(0, 0, 0, 0.7);
                        --cf-modal-bg: var(--cf-bg-secondary);
                        --cf-modal-border: var(--cf-card-border);
                        --cf-modal-shadow: 0 8px 30px rgba(255, 255, 255, 0.15);
                        --cf-modal-text: var(--cf-text-primary);
                        --cf-modal-text-secondary: var(--cf-text-secondary);
                    }

                    html, body {
                        line-height: 1.15;
                        -webkit-text-size-adjust: 100%;
                        box-sizing: border-box;
                        font-family: 'Inter', sans-serif;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    *, *::before, *::after {
                        box-sizing: inherit;
                    }

                    .cf-main-app-wrapper {
                        display: flex;
                        flex-direction: column;
                        min-height: 100vh;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .cf-cust-func-container {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: center;
                        padding: 20px;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                        box-sizing: border-box;
                    }

                    .cf-cust-func-content {
                        width: 100%;
                        max-width: 950px; /* Made wider */
                        margin: 0 auto;
                        padding-top: 10px; /* Reduced margin-top */
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .cf-cust-func-card {
                        background-color: var(--cf-bg-secondary);
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px var(--cf-box-shadow-medium);
                        transition: background-color 0.3s ease, box-shadow 0.3s ease;
                        width: 100%;
                        max-width: 900px; /* Made wider */
                        margin-bottom: 20px; /* Reduced margin-bottom */
                        box-sizing: border-box;
                    }

                    .cf-cust-func-card-header {
                        margin-bottom: 25px;
                        text-align: center;
                        
                    }

                    .cf-cust-func-card-title {
                        font-size: 2.2em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin: 0;
                        text-align: center;
                    }
                    .cf-cust-func-card-title.flex.items-center {
                        font-size: 1.8em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin-bottom: 15px;
                        border-bottom: 1px solid var(--cf-card-border);
                        padding-bottom: 10px;
                        justify-content: center;
                        gap:20px;
                    }

                    .cf-cust-func-form {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        padding-top: 10px;
                    }

                    .cf-cust-func-form-group {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 15px;
                    }

                    .cf-cust-func-form-group:last-of-type {
                        margin-bottom: 0;
                    }

                    .cf-cust-func-form-label {
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: var(--cf-text-secondary);
                        font-size: 1em;
                    }

                    .cf-cust-func-form-input {
                        padding: 12px;
                        border: 1px solid var(--cf-card-border);
                        border-radius: 8px;
                        font-size: 1em;
                        color: var(--cf-text-primary);
                        background-color: var(--cf-bg-primary);
                        transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .cf-cust-func-form-input:focus {
                        border-color: var(--cf-blue-accent);
                        outline: none;
                        box-shadow: 0 0 0 3px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cf-cust-func-form-input:disabled {
                        background-color: var(--cf-disabled-input-bg) !important;
                        cursor: not-allowed;
                        opacity: 0.8;
                    }

                    .cf-cust-func-button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 25px;
                        flex-wrap: wrap;
                    }

                    .cf-cust-func-primary-button,
                    .cf-cust-func-secondary-button {
                        padding: 14px 25px;
                        border: none;
                        border-radius: 8px;
                        font-size: 1.1em;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
                        min-width: 150px;
                        text-align: center;
                    }

                    .cf-cust-func-primary-button {
                        background-color: var(--cf-blue-accent);
                        color: white;
                        box-shadow: 0 4px 10px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cf-cust-func-primary-button:hover {
                        background-color: var(--cf-blue-accent-hover);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px rgba(var(--cf-blue-accent-rgb), 0.3);
                    }

                    .cf-cust-func-primary-button:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 5px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cf-cust-func-primary-button:disabled {
                        background-color: #cccccc;
                        color: #666666;
                        cursor: not-allowed;
                        box-shadow: none;
                    }


                    .cf-cust-func-secondary-button {
                        background-color: transparent;
                        color: var(--cf-blue-accent);
                        border: 1px solid var(--cf-blue-accent);
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-size: 1em;
                        cursor: pointer;
                        transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
                    }

                    .cf-cust-func-secondary-button:hover {
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.05);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    }

                    .cf-cust-func-secondary-button:active {
                        transform: translateY(0);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }

                    .cf-cust-func-loading-message,
                    .cf-cust-func-error-message,
                    .cf-cust-func-success-message {
                        text-align: center;
                        padding: 12px;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 0.95em;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .cf-cust-func-loading-message {
                        color: var(--cf-text-primary);
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.1);
                        border: 1px solid var(--cf-blue-accent);
                    }

                    .cf-cust-func-error-message {
                        color: var(--cf-red-error);
                        background-color: rgba(var(--cf-red-error-rgb), 0.1);
                        border: 1px solid var(--cf-red-error);
                    }

                    .cf-cust-func-success-message {
                        color: var(--cf-green-success);
                        background-color: rgba(var(--cf-green-success-rgb), 0.1);
                        border: 1px solid var(--cf-green-success);
                    }

                    .cf-cust-func-confirmation-details {
                        padding: 20px;
                        border: 1px solid var(--cf-card-border);
                        border-radius: 12px;
                        background-color: var(--cf-bg-primary);
                        text-align: center;
                        box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                        margin-top: 20px;
                        box-sizing: border-box;
                    }

                    .cf-cust-func-confirmation-details h3 {
                        font-size: 1.5em;
                        color: var(--cf-text-primary);
                        margin-bottom: 20px;
                        text-align: center;
                    }

                    .cf-cust-func-confirmation-details p {
                        margin-bottom: 10px;
                        font-size: 1em;
                        color: var(--cf-text-secondary);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .cf-cust-func-confirmation-details strong {
                        color: var(--cf-text-primary);
                    }

                    .cf-cust-func-warning-text {
                        color: var(--cf-red-error);
                        font-weight: 500;
                        margin-top: 20px;
                        margin-bottom: 25px;
                        font-size: 0.95em;
                        text-align: center;
                    }

                    .cf-account-details-section {
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid var(--cf-card-border);
                        text-align: center;
                    }

                    .cf-account-details-section p {
                        justify-content: center;
                        text-align: center;
                    }

                    .cf-transaction-history-section {
                        margin-top: 20px;
                    }

                    .cf-transactions-history-title {
                        font-size: 1.8em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin-bottom: 20px;
                        text-align: center;
                    }

                    .cf-no-transactions-message {
                        text-align: center;
                        color: var(--cf-text-secondary);
                        font-style: italic;
                        padding: 20px;
                        border: 1px dashed var(--cf-card-border);
                        border-radius: 8px;
                        margin-top: 20px;
                    }

                    .cf-transactions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }

                    .cf-transaction-item {
                        display: flex;
                        align-items: center;
                        background-color: var(--cf-bg-primary);
                        padding: 15px;
                        border-radius: 10px;
                        box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                        transition: all 0.2s ease;
                        border: 1px solid var(--cf-card-border);
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .cf-transaction-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
                    }

                    .cf-transaction-icon {
                        flex-shrink: 0;
                        margin-right: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                    }

                    .cf-transaction-type-debit .cf-transaction-icon {
                        color: white;
                        background-color: var(--cf-red-error);
                    }

                    .cf-transaction-type-credit .cf-transaction-icon {
                        color: white;
                        background-color: var(--cf-green-success);
                    }

                    .cf-transaction-details {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                    }

                    .cf-transaction-amount {
                        font-size: 1.2em;
                        font-weight: 700;
                        color: var(--cf-text-primary);
                        margin-bottom: 5px;
                    }

                    .cf-transaction-info {
                        font-size: 0.95em;
                        color: var(--cf-text-secondary);
                        margin-bottom: 3px;
                    }

                    .cf-transaction-purpose {
                        font-size: 0.85em;
                        color: var(--cf-text-light);
                        font-style: italic;
                        margin-top: 0;
                    }

                    .cf-transaction-meta {
                        flex-shrink: 0;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-left: 15px;
                    }

                    .cf-transaction-date {
                        font-size: 0.85em;
                        color: var(--cf-text-secondary);
                        margin-bottom: 5px;
                    }

                    .cf-transaction-type {
                        font-size: 0.8em;
                        padding: 4px 8px;
                        border-radius: 5px;
                        font-weight: 600;
                        color: white;
                        background-color: var(--cf-blue-accent);
                    }

                    .cf-transaction-item.cf-transaction-type-debit .cf-transaction-type {
                        background-color: var(--cf-red-error);
                    }

                    .cf-transaction-item.cf-transaction-type-credit .cf-transaction-type {
                        background-color: var(--cf-green-success);
                    }

                    @media (max-width: 768px) {
                        .cf-cust-func-container {
                            padding: 15px;
                        }

                        .cf-cust-func-card {
                            padding: 20px;
                        }

                        .cf-cust-func-card-title {
                            font-size: 1.8em;
                        }

                        .cf-cust-func-form-input,
                        .cf-cust-func-primary-button,
                        .cf-cust-func-secondary-button {
                            padding: 10px;
                            font-size: 0.95em;
                        }

                        .cf-cust-func-button-group {
                            flex-direction: column;
                            gap: 10px;
                        }

                        .cf-cust-func-primary-button,
                        .cf-cust-func-secondary-button {
                            width: 100%;
                        }

                        .cf-cust-func-confirmation-details {
                            padding: 15px;
                        }

                        .cf-transaction-item {
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                        }
                        .cf-transaction-icon {
                            margin-right: 0;
                            margin-bottom: 10px;
                        }
                        .cf-transaction-details {
                            width: 100%;
                            margin-bottom: 10px;
                        }
                        .cf-transaction-meta {
                            width: 100%;
                            margin-left: 0;
                            align-items: center;
                            padding-top: 10px;
                            border-top: 1px dashed var(--cf-card-border);
                        }
                        .cf-transaction-amount, .cf-transaction-info, .cf-transaction-purpose, .cf-transaction-date, .cf-transaction-type {
                            text-align: center;
                        }
                    }

                    @media (max-width: 480px) {
                        .cf-cust-func-container {
                            padding: 10px;
                        }

                        .cf-cust-func-card {
                            padding: 15px;
                        }

                        .cf-cust-func-card-title {
                            font-size: 1.5em;
                        }

                        .cf-cust-func-form-input {
                            font-size: 0.9em;
                        }

                        .cf-cust-func-loading-message,
                        .cf-cust-func-error-message,
                        .cf-cust-func-success-message {
                            padding: 8px;
                            font-size: 0.85em;
                        }
                    }

                    .cf-carousel-container {
                        position: relative;
                        width: 100%;
                        max-width: 900px; /* Made wider to match card */
                        overflow: hidden;
                        margin-bottom: 20px; /* Reduced margin-bottom */
                    }

                    .cf-carousel-wrapper {
                        display: flex;
                        transition: transform 0.5s ease-in-out;
                    }

                    .cf-carousel-item {
                        flex-shrink: 0;
                        width: 100%;
                    }

                    .cf-carousel-nav-button {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        background-color: rgba(0, 0, 0, 0.5);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        padding: 10px;
                        cursor: pointer;
                        z-index: 10;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    }

                    .cf-carousel-nav-button:hover {
                        background-color: rgba(0, 0, 0, 0.7);
                    }

                    .cf-carousel-nav-button:disabled {
                        background-color: rgba(0, 0, 0, 0.2);
                        cursor: not-allowed;
                    }

                    .cf-carousel-prev {
                        left: 10px;
                    }

                    .cf-carousel-next {
                        right: 10px;
                    }

                    .cf-cust-func-card.mb-6 { /* Specific target for margin adjustment */
                        margin-bottom: 20px; /* Reduced margin-bottom for individual cards outside carousel */
                    }

                    /* Ensure the specific title with flex items-center also has a gap */
                    .cf-cust-func-card-title.flex.items-center {
                        gap: 10px; /* Adjusted gap for title icons */
                    }


                    @media (max-width: 768px) {
                        .cf-carousel-nav-button {
                            padding: 8px;
                            font-size: 0.9em;
                        }
                    }
                `}
                </style>
            <div className="cf-cust-func-container">
                <div className="cf-cust-func-content">
                    <h2 className="cf-cust-func-card-title flex items-center">
                        <span className="flex items-center gap-2">
                             <Banknote size={24} style={{ color: 'var(--cf-blue-accent)' }} />
                             Account Transactions History
                        </span>
                    </h2>
                    <p className="cf-text-secondary cf-text-center">Review all incoming and outgoing transactions for your bank accounts.</p>

                    <div className="cf-carousel-container">
                        <div 
                            className="cf-carousel-wrapper" 
                            style={{ transform: `translateX(-${currentAccountIndex * 100}%)` }}
                        >
                            {customerAccounts.map(account => (
                                <div key={account.account_id} className="cf-cust-func-card cf-carousel-item">
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
                </div>
            </div>
        </div>
    );
}