import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'; // Icons for transactions

// Removed: import '../shared/normalize.css'; // Assuming normalize.css is handled globally or not strictly needed here
// Removed: import './CustFunction.css'; // Styles are now inline

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
        // If it's a UUID, just return the first few chars, otherwise mask the account number
        if (accountNo.length === 36 && accountNo.includes('-')) { // Basic check for UUID format
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
            <div className="main-app-wrapper">
                <style>{`
                    /* Inline styles from CustFunction.css and normalize.css combined */
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

                    /* Original styles from CustFunction.css */
                    html, body {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .main-app-wrapper {
                        display: flex;
                        flex-direction: column;
                        min-height: 100vh;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .cust-func-container {
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

                    .cust-func-content {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        padding-top: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .cust-func-card {
                        background-color: var(--cf-bg-secondary);
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px var(--cf-box-shadow-medium);
                        transition: background-color 0.3s ease, box-shadow 0.3s ease;
                        width: 100%;
                        max-width: 750px;
                        margin-bottom: 30px;
                        box-sizing: border-box;
                    }

                    .cust-func-card-header {
                        margin-bottom: 25px;
                        text-align: center;
                        
                    }

                    .cust-func-card-title {
                        font-size: 2.2em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin: 0;
                        text-align: center;
                    }

                    .cust-func-form {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        padding-top: 10px;
                    }

                    .cust-func-form-group {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 15px;
                    }

                    .cust-func-form-group:last-of-type {
                        margin-bottom: 0;
                    }

                    .cust-func-form-label {
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: var(--cf-text-secondary);
                        font-size: 1em;
                    }

                    .cust-func-form-input {
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

                    .cust-func-form-input:focus {
                        border-color: var(--cf-blue-accent);
                        outline: none;
                        box-shadow: 0 0 0 3px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-form-input:disabled {
                        background-color: var(--cf-disabled-input-bg) !important;
                        cursor: not-allowed;
                        opacity: 0.8;
                    }

                    .cust-func-button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 25px;
                        flex-wrap: wrap;
                    }

                    .cust-func-primary-button,
                    .cust-func-secondary-button {
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

                    .cust-func-primary-button {
                        background-color: var(--cf-blue-accent);
                        color: white;
                        box-shadow: 0 4px 10px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-primary-button:hover {
                        background-color: var(--cf-blue-accent-hover);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px rgba(var(--cf-blue-accent-rgb), 0.3);
                    }

                    .cust-func-primary-button:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 5px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-primary-button:disabled {
                        background-color: #cccccc;
                        color: #666666;
                        cursor: not-allowed;
                        box-shadow: none;
                    }


                    .cust-func-secondary-button {
                        background-color: transparent;
                        color: var(--cf-blue-accent);
                        border: 1px solid var(--cf-blue-accent);
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }

                    .cust-func-secondary-button:hover {
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.05);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    }

                    .cust-func-secondary-button:active {
                        transform: translateY(0);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }

                    .cust-func-loading-message,
                    .cust-func-error-message,
                    .cust-func-success-message {
                        text-align: center;
                        padding: 12px;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 0.95em;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .cust-func-loading-message {
                        color: var(--cf-text-primary);
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.1);
                        border: 1px solid var(--cf-blue-accent);
                    }

                    .cust-func-error-message {
                        color: var(--cf-red-error);
                        background-color: rgba(var(--cf-red-error-rgb), 0.1);
                        border: 1px solid var(--cf-red-error);
                    }

                    .cust-func-success-message {
                        color: var(--cf-green-success);
                        background-color: rgba(var(--cf-green-success-rgb), 0.1);
                        border: 1px solid var(--cf-green-success);
                    }

                    .cust-func-confirmation-details {
                        padding: 20px;
                        border: 1px solid var(--cf-card-border);
                        border-radius: 12px;
                        background-color: var(--cf-bg-primary);
                        text-align: center;
                        box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                        margin-top: 20px;
                        box-sizing: border-box;
                    }

                    .cust-func-confirmation-details h3 {
                        font-size: 1.5em;
                        color: var(--cf-text-primary);
                        margin-bottom: 20px;
                        text-align: center;
                    }

                    .cust-func-confirmation-details p {
                        margin-bottom: 10px;
                        font-size: 1em;
                        color: var(--cf-text-secondary);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .cust-func-confirmation-details strong {
                        color: var(--cf-text-primary);
                    }

                    .cust-func-warning-text {
                        color: var(--cf-red-error);
                        font-weight: 500;
                        margin-top: 20px;
                        margin-bottom: 25px;
                        font-size: 0.95em;
                        text-align: center;
                    }

                    .account-details-section {
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid var(--cf-card-border);
                        text-align: center;
                    }

                    .account-details-section p {
                        justify-content: center;
                        text-align: center;
                    }

                    .transaction-history-section {
                        margin-top: 20px;
                    }

                    .transactions-history-title {
                        font-size: 1.8em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin-bottom: 20px;
                        text-align: center;
                    }

                    .no-transactions-message {
                        text-align: center;
                        color: var(--cf-text-secondary);
                        font-style: italic;
                        padding: 20px;
                        border: 1px dashed var(--cf-card-border);
                        border-radius: 8px;
                        margin-top: 20px;
                    }

                    .transactions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }

                    .transaction-item {
                        display: flex;
                        align-items: center;
                        background-color: var(--cf-bg-secondary);
                        padding: 15px;
                        border-radius: 10px;
                        box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                        transition: all 0.2s ease;
                        border: 1px solid var(--cf-card-border);
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .transaction-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
                    }

                    .transaction-icon {
                        flex-shrink: 0;
                        margin-right: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                    }

                    .transaction-type-debit .transaction-icon {
                        color: white;
                        background-color: var(--cf-red-error);
                    }

                    .transaction-type-credit .transaction-icon {
                        color: white;
                        background-color: var(--cf-green-success);
                    }

                    .transaction-details {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                    }

                    .transaction-amount {
                        font-size: 1.2em;
                        font-weight: 700;
                        color: var(--cf-text-primary);
                        margin-bottom: 5px;
                    }

                    .transaction-info {
                        font-size: 0.95em;
                        color: var(--cf-text-secondary);
                        margin-bottom: 3px;
                    }

                    .transaction-purpose {
                        font-size: 0.85em;
                        color: var(--cf-text-light);
                        font-style: italic;
                        margin-top: 0;
                    }

                    .transaction-meta {
                        flex-shrink: 0;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-left: 15px;
                    }

                    .transaction-date {
                        font-size: 0.85em;
                        color: var(--cf-text-secondary);
                        margin-bottom: 5px;
                    }

                    .transaction-type {
                        font-size: 0.8em;
                        padding: 4px 8px;
                        border-radius: 5px;
                        font-weight: 600;
                        color: white;
                        background-color: var(--cf-blue-accent);
                    }

                    .transaction-item.transaction-type-debit .transaction-type {
                        background-color: var(--cf-red-error);
                    }

                    .transaction-item.transaction-type-credit .transaction-type {
                        background-color: var(--cf-green-success);
                    }

                    @media (max-width: 768px) {
                        .cust-func-container {
                            padding: 15px;
                        }

                        .cust-func-card {
                            padding: 20px;
                        }

                        .cust-func-card-title {
                            font-size: 1.8em;
                        }

                        .cust-func-form-input,
                        .cust-func-primary-button,
                        .cust-func-secondary-button {
                            padding: 10px;
                            font-size: 0.95em;
                        }

                        .cust-func-button-group {
                            flex-direction: column;
                            gap: 10px;
                        }

                        .cust-func-primary-button,
                        .cust-func-secondary-button {
                            width: 100%;
                        }

                        .cust-func-confirmation-details {
                            padding: 15px;
                        }

                        .transaction-item {
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                        }
                        .transaction-icon {
                            margin-right: 0;
                            margin-bottom: 10px;
                        }
                        .transaction-details {
                            width: 100%;
                            margin-bottom: 10px;
                        }
                        .transaction-meta {
                            width: 100%;
                            margin-left: 0;
                            align-items: center;
                            padding-top: 10px;
                            border-top: 1px dashed var(--cf-card-border);
                        }
                        .transaction-amount, .transaction-info, .transaction-purpose, .transaction-date, .transaction-type {
                            text-align: center;
                        }
                    }

                    @media (max-width: 480px) {
                        .cust-func-container {
                            padding: 10px;
                        }

                        .cust-func-card {
                            padding: 15px;
                        }

                        .cust-func-card-title {
                            font-size: 1.5em;
                        }

                        .cust-func-form-input {
                            font-size: 0.9em;
                        }

                        .cust-func-loading-message,
                        .cust-func-error-message,
                        .cust-func-success-message {
                            padding: 8px;
                            font-size: 0.85em;
                        }
                    }

                    /* From Loan Submission Complete - Specific for this component if needed */
                    .loan-application-page {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f0f2f5;
                        color: #333;
                    }

                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }

                    .loan-header {
                        background-color: #004085; /* Dark blue */
                        color: white;
                        padding: 20px 0;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        margin-bottom: 30px;
                    }

                    .header-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 20px;
                    }

                    .logo-section {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .logo-icon {
                        font-size: 2.5em;
                    }

                    .logo-text {
                        font-size: 1.8em;
                        font-weight: bold;
                    }

                    .header-title {
                        text-align: right;
                    }

                    .header-title h1 {
                        margin: 0;
                        font-size: 2.2em;
                    }

                    .header-title p {
                        margin: 5px 0 0;
                        font-size: 1em;
                        opacity: 0.9;
                    }

                    .dashboard-footer {
                        background-color: #f0f2f5;
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #e0e0e0;
                        color: #555;
                        font-size: 0.9em;
                        margin-top: auto; /* Pushes footer to the bottom */
                    }

                    .footer-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                    }

                    .footer-links a {
                        color: #007bff;
                        text-decoration: none;
                        margin: 0 10px;
                    }

                    .footer-links a:hover {
                        text-decoration: underline;
                    }
                `}</style>
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
                <style>{`
                    /* Inline styles from CustFunction.css and normalize.css combined */
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

                    /* Original styles from CustFunction.css */
                    html, body {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .main-app-wrapper {
                        display: flex;
                        flex-direction: column;
                        min-height: 100vh;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .cust-func-container {
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

                    .cust-func-content {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        padding-top: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .cust-func-card {
                        background-color: var(--cf-bg-secondary);
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px var(--cf-box-shadow-medium);
                        transition: background-color 0.3s ease, box-shadow 0.3s ease;
                        width: 100%;
                        max-width: 750px;
                        margin-bottom: 30px;
                        box-sizing: border-box;
                    }

                    .cust-func-card-header {
                        margin-bottom: 25px;
                        text-align: center;
                        
                    }

                    .cust-func-card-title {
                        font-size: 2.2em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin: 0;
                        text-align: center;
                    }

                    .cust-func-form {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        padding-top: 10px;
                    }

                    .cust-func-form-group {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 15px;
                    }

                    .cust-func-form-group:last-of-type {
                        margin-bottom: 0;
                    }

                    .cust-func-form-label {
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: var(--cf-text-secondary);
                        font-size: 1em;
                    }

                    .cust-func-form-input {
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

                    .cust-func-form-input:focus {
                        border-color: var(--cf-blue-accent);
                        outline: none;
                        box-shadow: 0 0 0 3px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-form-input:disabled {
                        background-color: var(--cf-disabled-input-bg) !important;
                        cursor: not-allowed;
                        opacity: 0.8;
                    }

                    .cust-func-button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 25px;
                        flex-wrap: wrap;
                    }

                    .cust-func-primary-button,
                    .cust-func-secondary-button {
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

                    .cust-func-primary-button {
                        background-color: var(--cf-blue-accent);
                        color: white;
                        box-shadow: 0 4px 10px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-primary-button:hover {
                        background-color: var(--cf-blue-accent-hover);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px rgba(var(--cf-blue-accent-rgb), 0.3);
                    }

                    .cust-func-primary-button:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 5px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-primary-button:disabled {
                        background-color: #cccccc;
                        color: #666666;
                        cursor: not-allowed;
                        box-shadow: none;
                    }


                    .cust-func-secondary-button {
                        background-color: transparent;
                        color: var(--cf-blue-accent);
                        border: 1px solid var(--cf-blue-accent);
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }

                    .cust-func-secondary-button:hover {
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.05);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    }

                    .cust-func-secondary-button:active {
                        transform: translateY(0);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }

                    .cust-func-loading-message,
                    .cust-func-error-message,
                    .cust-func-success-message {
                        text-align: center;
                        padding: 12px;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 0.95em;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .cust-func-loading-message {
                        color: var(--cf-text-primary);
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.1);
                        border: 1px solid var(--cf-blue-accent);
                    }

                    .cust-func-error-message {
                        color: var(--cf-red-error);
                        background-color: rgba(var(--cf-red-error-rgb), 0.1);
                        border: 1px solid var(--cf-red-error);
                    }

                    .cust-func-success-message {
                        color: var(--cf-green-success);
                        background-color: rgba(var(--cf-green-success-rgb), 0.1);
                        border: 1px solid var(--cf-green-success);
                    }

                    .cust-func-confirmation-details {
                        padding: 20px;
                        border: 1px solid var(--cf-card-border);
                        border-radius: 12px;
                        background-color: var(--cf-bg-primary);
                        text-align: center;
                        box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                        margin-top: 20px;
                        box-sizing: border-box;
                    }

                    .cust-func-confirmation-details h3 {
                        font-size: 1.5em;
                        color: var(--cf-text-primary);
                        margin-bottom: 20px;
                        text-align: center;
                    }

                    .cust-func-confirmation-details p {
                        margin-bottom: 10px;
                        font-size: 1em;
                        color: var(--cf-text-secondary);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .cust-func-confirmation-details strong {
                        color: var(--cf-text-primary);
                    }

                    .cust-func-warning-text {
                        color: var(--cf-red-error);
                        font-weight: 500;
                        margin-top: 20px;
                        margin-bottom: 25px;
                        font-size: 0.95em;
                        text-align: center;
                    }

                    .account-details-section {
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid var(--cf-card-border);
                        text-align: center;
                    }

                    .account-details-section p {
                        justify-content: center;
                        text-align: center;
                    }

                    .transaction-history-section {
                        margin-top: 20px;
                    }

                    .transactions-history-title {
                        font-size: 1.8em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin-bottom: 20px;
                        text-align: center;
                    }

                    .no-transactions-message {
                        text-align: center;
                        color: var(--cf-text-secondary);
                        font-style: italic;
                        padding: 20px;
                        border: 1px dashed var(--cf-card-border);
                        border-radius: 8px;
                        margin-top: 20px;
                    }

                    .transactions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }

                    .transaction-item {
                        display: flex;
                        align-items: center;
                        background-color: var(--cf-bg-secondary);
                        padding: 15px;
                        border-radius: 10px;
                        box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                        transition: all 0.2s ease;
                        border: 1px solid var(--cf-card-border);
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .transaction-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
                    }

                    .transaction-icon {
                        flex-shrink: 0;
                        margin-right: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                    }

                    .transaction-type-debit .transaction-icon {
                        color: white;
                        background-color: var(--cf-red-error);
                    }

                    .transaction-type-credit .transaction-icon {
                        color: white;
                        background-color: var(--cf-green-success);
                    }

                    .transaction-details {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                    }

                    .transaction-amount {
                        font-size: 1.2em;
                        font-weight: 700;
                        color: var(--cf-text-primary);
                        margin-bottom: 5px;
                    }

                    .transaction-info {
                        font-size: 0.95em;
                        color: var(--cf-text-secondary);
                        margin-bottom: 3px;
                    }

                    .transaction-purpose {
                        font-size: 0.85em;
                        color: var(--cf-text-light);
                        font-style: italic;
                        margin-top: 0;
                    }

                    .transaction-meta {
                        flex-shrink: 0;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-left: 15px;
                    }

                    .transaction-date {
                        font-size: 0.85em;
                        color: var(--cf-text-secondary);
                        margin-bottom: 5px;
                    }

                    .transaction-type {
                        font-size: 0.8em;
                        padding: 4px 8px;
                        border-radius: 5px;
                        font-weight: 600;
                        color: white;
                        background-color: var(--cf-blue-accent);
                    }

                    .transaction-item.transaction-type-debit .transaction-type {
                        background-color: var(--cf-red-error);
                    }

                    .transaction-item.transaction-type-credit .transaction-type {
                        background-color: var(--cf-green-success);
                    }

                    @media (max-width: 768px) {
                        .cust-func-container {
                            padding: 15px;
                        }

                        .cust-func-card {
                            padding: 20px;
                        }

                        .cust-func-card-title {
                            font-size: 1.8em;
                        }

                        .cust-func-form-input,
                        .cust-func-primary-button,
                        .cust-func-secondary-button {
                            padding: 10px;
                            font-size: 0.95em;
                        }

                        .cust-func-button-group {
                            flex-direction: column;
                            gap: 10px;
                        }

                        .cust-func-primary-button,
                        .cust-func-secondary-button {
                            width: 100%;
                        }

                        .cust-func-confirmation-details {
                            padding: 15px;
                        }

                        .transaction-item {
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                        }
                        .transaction-icon {
                            margin-right: 0;
                            margin-bottom: 10px;
                        }
                        .transaction-details {
                            width: 100%;
                            margin-bottom: 10px;
                        }
                        .transaction-meta {
                            width: 100%;
                            margin-left: 0;
                            align-items: center;
                            padding-top: 10px;
                            border-top: 1px dashed var(--cf-card-border);
                        }
                        .transaction-amount, .transaction-info, .transaction-purpose, .transaction-date, .transaction-type {
                            text-align: center;
                        }
                    }

                    @media (max-width: 480px) {
                        .cust-func-container {
                            padding: 10px;
                        }

                        .cust-func-card {
                            padding: 15px;
                        }

                        .cust-func-card-title {
                            font-size: 1.5em;
                        }

                        .cust-func-form-input {
                            font-size: 0.9em;
                        }

                        .cust-func-loading-message,
                        .cust-func-error-message,
                        .cust-func-success-message {
                            padding: 8px;
                            font-size: 0.85em;
                        }
                    }

                    /* From Loan Submission Complete - Specific for this component if needed */
                    .loan-application-page {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f0f2f5;
                        color: #333;
                    }

                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }

                    .loan-header {
                        background-color: #004085; /* Dark blue */
                        color: white;
                        padding: 20px 0;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        margin-bottom: 30px;
                    }

                    .header-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 20px;
                    }

                    .logo-section {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .logo-icon {
                        font-size: 2.5em;
                    }

                    .logo-text {
                        font-size: 1.8em;
                        font-weight: bold;
                    }

                    .header-title {
                        text-align: right;
                    }

                    .header-title h1 {
                        margin: 0;
                        font-size: 2.2em;
                    }

                    .header-title p {
                        margin: 5px 0 0;
                        font-size: 1em;
                        opacity: 0.9;
                    }

                    .dashboard-footer {
                        background-color: #f0f2f5;
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #e0e0e0;
                        color: #555;
                        font-size: 0.9em;
                        margin-top: auto; /* Pushes footer to the bottom */
                    }

                    .footer-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                    }

                    .footer-links a {
                        color: #007bff;
                        text-decoration: none;
                        margin: 0 10px;
                    }

                    .footer-links a:hover {
                        text-decoration: underline;
                    }
                `}</style>
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
                <style>{`
                    /* Inline styles from CustFunction.css and normalize.css combined */
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

                    /* Original styles from CustFunction.css */
                    html, body {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .main-app-wrapper {
                        display: flex;
                        flex-direction: column;
                        min-height: 100vh;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .cust-func-container {
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

                    .cust-func-content {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        padding-top: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .cust-func-card {
                        background-color: var(--cf-bg-secondary);
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px var(--cf-box-shadow-medium);
                        transition: background-color 0.3s ease, box-shadow 0.3s ease;
                        width: 100%;
                        max-width: 750px;
                        margin-bottom: 30px;
                        box-sizing: border-box;
                    }

                    .cust-func-card-header {
                        margin-bottom: 25px;
                        text-align: center;
                        
                    }

                    .cust-func-card-title {
                        font-size: 2.2em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin: 0;
                        text-align: center;
                    }

                    .cust-func-form {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        padding-top: 10px;
                    }

                    .cust-func-form-group {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 15px;
                    }

                    .cust-func-form-group:last-of-type {
                        margin-bottom: 0;
                    }

                    .cust-func-form-label {
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: var(--cf-text-secondary);
                        font-size: 1em;
                    }

                    .cust-func-form-input {
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

                    .cust-func-form-input:focus {
                        border-color: var(--cf-blue-accent);
                        outline: none;
                        box-shadow: 0 0 0 3px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-form-input:disabled {
                        background-color: var(--cf-disabled-input-bg) !important;
                        cursor: not-allowed;
                        opacity: 0.8;
                    }

                    .cust-func-button-group {
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 25px;
                        flex-wrap: wrap;
                    }

                    .cust-func-primary-button,
                    .cust-func-secondary-button {
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

                    .cust-func-primary-button {
                        background-color: var(--cf-blue-accent);
                        color: white;
                        box-shadow: 0 4px 10px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-primary-button:hover {
                        background-color: var(--cf-blue-accent-hover);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px rgba(var(--cf-blue-accent-rgb), 0.3);
                    }

                    .cust-func-primary-button:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 5px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-primary-button:disabled {
                        background-color: #cccccc;
                        color: #666666;
                        cursor: not-allowed;
                        box-shadow: none;
                    }


                    .cust-func-secondary-button {
                        background-color: transparent;
                        color: var(--cf-blue-accent);
                        border: 1px solid var(--cf-blue-accent);
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }

                    .cust-func-secondary-button:hover {
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.05);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    }

                    .cust-func-secondary-button:active {
                        transform: translateY(0);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }

                    .cust-func-loading-message,
                    .cust-func-error-message,
                    .cust-func-success-message {
                        text-align: center;
                        padding: 12px;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 0.95em;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .cust-func-loading-message {
                        color: var(--cf-text-primary);
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.1);
                        border: 1px solid var(--cf-blue-accent);
                    }

                    .cust-func-error-message {
                        color: var(--cf-red-error);
                        background-color: rgba(var(--cf-red-error-rgb), 0.1);
                        border: 1px solid var(--cf-red-error);
                    }

                    .cust-func-success-message {
                        color: var(--cf-green-success);
                        background-color: rgba(var(--cf-green-success-rgb), 0.1);
                        border: 1px solid var(--cf-green-success);
                    }

                    .cust-func-confirmation-details {
                        padding: 20px;
                        border: 1px solid var(--cf-card-border);
                        border-radius: 12px;
                        background-color: var(--cf-bg-primary);
                        text-align: center;
                        box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                        margin-top: 20px;
                        box-sizing: border-box;
                    }

                    .cust-func-confirmation-details h3 {
                        font-size: 1.5em;
                        color: var(--cf-text-primary);
                        margin-bottom: 20px;
                        text-align: center;
                    }

                    .cust-func-confirmation-details p {
                        margin-bottom: 10px;
                        font-size: 1em;
                        color: var(--cf-text-secondary);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .cust-func-confirmation-details strong {
                        color: var(--cf-text-primary);
                    }

                    .cust-func-warning-text {
                        color: var(--cf-red-error);
                        font-weight: 500;
                        margin-top: 20px;
                        margin-bottom: 25px;
                        font-size: 0.95em;
                        text-align: center;
                    }

                    .account-details-section {
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid var(--cf-card-border);
                        text-align: center;
                    }

                    .account-details-section p {
                        justify-content: center;
                        text-align: center;
                    }

                    .transaction-history-section {
                        margin-top: 20px;
                    }

                    .transactions-history-title {
                        font-size: 1.8em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin-bottom: 20px;
                        text-align: center;
                    }

                    .no-transactions-message {
                        text-align: center;
                        color: var(--cf-text-secondary);
                        font-style: italic;
                        padding: 20px;
                        border: 1px dashed var(--cf-card-border);
                        border-radius: 8px;
                        margin-top: 20px;
                    }

                    .transactions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }

                    .transaction-item {
                        display: flex;
                        align-items: center;
                        background-color: var(--cf-bg-secondary);
                        padding: 15px;
                        border-radius: 10px;
                        box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                        transition: all 0.2s ease;
                        border: 1px solid var(--cf-card-border);
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .transaction-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
                    }

                    .transaction-icon {
                        flex-shrink: 0;
                        margin-right: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                    }

                    .transaction-type-debit .transaction-icon {
                        color: white;
                        background-color: var(--cf-red-error);
                    }

                    .transaction-type-credit .transaction-icon {
                        color: white;
                        background-color: var(--cf-green-success);
                    }

                    .transaction-details {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                    }

                    .transaction-amount {
                        font-size: 1.2em;
                        font-weight: 700;
                        color: var(--cf-text-primary);
                        margin-bottom: 5px;
                    }

                    .transaction-info {
                        font-size: 0.95em;
                        color: var(--cf-text-secondary);
                        margin-bottom: 3px;
                    }

                    .transaction-purpose {
                        font-size: 0.85em;
                        color: var(--cf-text-light);
                        font-style: italic;
                        margin-top: 0;
                    }

                    .transaction-meta {
                        flex-shrink: 0;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-left: 15px;
                    }

                    .transaction-date {
                        font-size: 0.85em;
                        color: var(--cf-text-secondary);
                        margin-bottom: 5px;
                    }

                    .transaction-type {
                        font-size: 0.8em;
                        padding: 4px 8px;
                        border-radius: 5px;
                        font-weight: 600;
                        color: white;
                        background-color: var(--cf-blue-accent);
                    }

                    .transaction-item.transaction-type-debit .transaction-type {
                        background-color: var(--cf-red-error);
                    }

                    .transaction-item.transaction-type-credit .transaction-type {
                        background-color: var(--cf-green-success);
                    }

                    @media (max-width: 768px) {
                        .cust-func-container {
                            padding: 15px;
                        }

                        .cust-func-card {
                            padding: 20px;
                        }

                        .cust-func-card-title {
                            font-size: 1.8em;
                        }

                        .cust-func-form-input,
                        .cust-func-primary-button,
                        .cust-func-secondary-button {
                            padding: 10px;
                            font-size: 0.95em;
                        }

                        .cust-func-button-group {
                            flex-direction: column;
                            gap: 10px;
                        }

                        .cust-func-primary-button,
                        .cust-func-secondary-button {
                            width: 100%;
                        }

                        .cust-func-confirmation-details {
                            padding: 15px;
                        }

                        .transaction-item {
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                        }
                        .transaction-icon {
                            margin-right: 0;
                            margin-bottom: 10px;
                        }
                        .transaction-details {
                            width: 100%;
                            margin-bottom: 10px;
                        }
                        .transaction-meta {
                            width: 100%;
                            margin-left: 0;
                            align-items: center;
                            padding-top: 10px;
                            border-top: 1px dashed var(--cf-card-border);
                        }
                        .transaction-amount, .transaction-info, .transaction-purpose, .transaction-date, .transaction-type {
                            text-align: center;
                        }
                    }

                    @media (max-width: 480px) {
                        .cust-func-container {
                            padding: 10px;
                        }

                        .cust-func-card {
                            padding: 15px;
                        }

                        .cust-func-card-title {
                            font-size: 1.5em;
                        }

                        .cust-func-form-input {
                            font-size: 0.9em;
                        }

                        .cust-func-loading-message,
                        .cust-func-error-message,
                        .cust-func-success-message {
                            padding: 8px;
                            font-size: 0.85em;
                        }
                    }

                    /* From Loan Submission Complete - Specific for this component if needed */
                    .loan-application-page {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f0f2f5;
                        color: #333;
                    }

                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }

                    .loan-header {
                        background-color: #004085; /* Dark blue */
                        color: white;
                        padding: 20px 0;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        margin-bottom: 30px;
                    }

                    .header-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 20px;
                    }

                    .logo-section {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .logo-icon {
                        font-size: 2.5em;
                    }

                    .logo-text {
                        font-size: 1.8em;
                        font-weight: bold;
                    }

                    .header-title {
                        text-align: right;
                    }

                    .header-title h1 {
                        margin: 0;
                        font-size: 2.2em;
                    }

                    .header-title p {
                        margin: 5px 0 0;
                        font-size: 1em;
                        opacity: 0.9;
                    }

                    .dashboard-footer {
                        background-color: #f0f2f5;
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #e0e0e0;
                        color: #555;
                        font-size: 0.9em;
                        margin-top: auto; /* Pushes footer to the bottom */
                    }

                    .footer-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                    }

                    .footer-links a {
                        color: #007bff;
                        text-decoration: none;
                        margin: 0 10px;
                    }

                    .footer-links a:hover {
                        text-decoration: underline;
                    }
                `}</style>
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
            <style>{`
                /* Inline styles from CustFunction.css and normalize.css combined */
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

                /* Original styles from CustFunction.css */
                html, body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    background-color: var(--cf-bg-primary);
                    color: var(--cf-text-primary);
                    transition: background-color 0.3s ease, color 0.3s ease;
                }

                .main-app-wrapper {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background-color: var(--cf-bg-primary);
                    color: var(--cf-text-primary);
                    transition: background-color 0.3s ease, color 0.3s ease;
                }

                .cust-func-container {
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

                .cust-func-content {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    padding-top: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    flex-direction: column;
                }

                .cust-func-card {
                    background-color: var(--cf-bg-secondary);
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px var(--cf-box-shadow-medium);
                    transition: background-color 0.3s ease, box-shadow 0.3s ease;
                    width: 100%;
                    max-width: 750px;
                    margin-bottom: 30px;
                    box-sizing: border-box;
                }

                .cust-func-card-header {
                    margin-bottom: 25px;
                    text-align: center;
                    
                }

                .cust-func-card-title {
                    font-size: 2.2em;
                    font-weight: bold;
                    color: var(--cf-text-primary);
                    margin: 0;
                    text-align: center;
                }

                .cust-func-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding-top: 10px;
                }

                .cust-func-form-group {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 15px;
                }

                .cust-func-form-group:last-of-type {
                    margin-bottom: 0;
                }

                .cust-func-form-label {
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: var(--cf-text-secondary);
                    font-size: 1em;
                }

                .cust-func-form-input {
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

                .cust-func-form-input:focus {
                    border-color: var(--cf-blue-accent);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(var(--cf-blue-accent-rgb), 0.2);
                }

                .cust-func-form-input:disabled {
                    background-color: var(--cf-disabled-input-bg) !important;
                    cursor: not-allowed;
                    opacity: 0.8;
                }

                .cust-func-button-group {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 25px;
                    flex-wrap: wrap;
                }

                .cust-func-primary-button,
                .cust-func-secondary-button {
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

                .cust-func-primary-button {
                    background-color: var(--cf-blue-accent);
                    color: white;
                    box-shadow: 0 4px 10px rgba(var(--cf-blue-accent-rgb), 0.2);
                }

                .cust-func-primary-button:hover {
                    background-color: var(--cf-blue-accent-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(var(--cf-blue-accent-rgb), 0.3);
                }

                .cust-func-primary-button:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 5px rgba(var(--cf-blue-accent-rgb), 0.2);
                }

                .cust-func-primary-button:disabled {
                    background-color: #cccccc;
                    color: #666666;
                    cursor: not-allowed;
                    box-shadow: none;
                }


                .cust-func-secondary-button {
                    background-color: transparent;
                    color: var(--cf-blue-accent);
                    border: 1px solid var(--cf-blue-accent);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }

                .cust-func-secondary-button:hover {
                    background-color: rgba(var(--cf-blue-accent-rgb), 0.05);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .cust-func-secondary-button:active {
                    transform: translateY(0);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .cust-func-loading-message,
                .cust-func-error-message,
                .cust-func-success-message {
                    text-align: center;
                    padding: 12px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 0.95em;
                    width: 100%;
                    box-sizing: border-box;
                }

                .cust-func-loading-message {
                    color: var(--cf-text-primary);
                    background-color: rgba(var(--cf-blue-accent-rgb), 0.1);
                    border: 1px solid var(--cf-blue-accent);
                }

                .cust-func-error-message {
                    color: var(--cf-red-error);
                    background-color: rgba(var(--cf-red-error-rgb), 0.1);
                    border: 1px solid var(--cf-red-error);
                }

                .cust-func-success-message {
                    color: var(--cf-green-success);
                    background-color: rgba(var(--cf-green-success-rgb), 0.1);
                    border: 1px solid var(--cf-green-success);
                }

                .cust-func-confirmation-details {
                    padding: 20px;
                    border: 1px solid var(--cf-card-border);
                    border-radius: 12px;
                    background-color: var(--cf-bg-primary);
                    text-align: center;
                    box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                    margin-top: 20px;
                    box-sizing: border-box;
                }

                .cust-func-confirmation-details h3 {
                    font-size: 1.5em;
                    color: var(--cf-text-primary);
                    margin-bottom: 20px;
                    text-align: center;
                }

                .cust-func-confirmation-details p {
                    margin-bottom: 10px;
                    font-size: 1em;
                    color: var(--cf-text-secondary);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .cust-func-confirmation-details strong {
                    color: var(--cf-text-primary);
                }

                .cust-func-warning-text {
                    color: var(--cf-red-error);
                    font-weight: 500;
                    margin-top: 20px;
                    margin-bottom: 25px;
                    font-size: 0.95em;
                    text-align: center;
                }

                .account-details-section {
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--cf-card-border);
                    text-align: center;
                }

                .account-details-section p {
                    justify-content: center;
                    text-align: center;
                }

                .transaction-history-section {
                    margin-top: 20px;
                }

                .transactions-history-title {
                    font-size: 1.8em;
                    font-weight: bold;
                    color: var(--cf-text-primary);
                    margin-bottom: 20px;
                    text-align: center;
                }

                .no-transactions-message {
                    text-align: center;
                    color: var(--cf-text-secondary);
                    font-style: italic;
                    padding: 20px;
                    border: 1px dashed var(--cf-card-border);
                    border-radius: 8px;
                    margin-top: 20px;
                }

                .transactions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .transaction-item {
                    display: flex;
                    align-items: center;
                    background-color: var(--cf-bg-secondary);
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px var(--cf-box-shadow-light);
                    transition: all 0.2s ease;
                    border: 1px solid var(--cf-card-border);
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .transaction-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
                }

                .transaction-icon {
                    flex-shrink: 0;
                    margin-right: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                }

                .transaction-type-debit .transaction-icon {
                    color: white;
                    background-color: var(--cf-red-error);
                }

                .transaction-type-credit .transaction-icon {
                    color: white;
                    background-color: var(--cf-green-success);
                }

                .transaction-details {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    text-align: center;
                    align-items: center;
                }

                .transaction-amount {
                    font-size: 1.2em;
                    font-weight: 700;
                    color: var(--cf-text-primary);
                    margin-bottom: 5px;
                }

                .transaction-info {
                    font-size: 0.95em;
                    color: var(--cf-text-secondary);
                    margin-bottom: 3px;
                }

                .transaction-purpose {
                    font-size: 0.85em;
                    color: var(--cf-text-light);
                    font-style: italic;
                    margin-top: 0;
                }

                .transaction-meta {
                    flex-shrink: 0;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-left: 15px;
                }

                .transaction-date {
                    font-size: 0.85em;
                    color: var(--cf-text-secondary);
                    margin-bottom: 5px;
                }

                .transaction-type {
                    font-size: 0.8em;
                    padding: 4px 8px;
                    border-radius: 5px;
                    font-weight: 600;
                    color: white;
                    background-color: var(--cf-blue-accent);
                }

                .transaction-item.transaction-type-debit .transaction-type {
                    background-color: var(--cf-red-error);
                }

                .transaction-item.transaction-type-credit .transaction-type {
                    background-color: var(--cf-green-success);
                }

                @media (max-width: 768px) {
                    .cust-func-container {
                        padding: 15px;
                    }

                    .cust-func-card {
                        padding: 20px;
                    }

                    .cust-func-card-title {
                        font-size: 1.8em;
                    }

                    .cust-func-form-input,
                    .cust-func-primary-button,
                    .cust-func-secondary-button {
                        padding: 10px;
                        font-size: 0.95em;
                    }

                    .cust-func-button-group {
                        flex-direction: column;
                        gap: 10px;
                    }

                    .cust-func-primary-button,
                    .cust-func-secondary-button {
                        width: 100%;
                    }

                    .cust-func-confirmation-details {
                        padding: 15px;
                    }

                    .transaction-item {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                    .transaction-icon {
                        margin-right: 0;
                        margin-bottom: 10px;
                    }
                    .transaction-details {
                        width: 100%;
                        margin-bottom: 10px;
                    }
                    .transaction-meta {
                        width: 100%;
                        margin-left: 0;
                        align-items: center;
                        padding-top: 10px;
                        border-top: 1px dashed var(--cf-card-border);
                    }
                    .transaction-amount, .transaction-info, .transaction-purpose, .transaction-date, .transaction-type {
                        text-align: center;
                    }
                }

                @media (max-width: 480px) {
                    .cust-func-container {
                        padding: 10px;
                    }

                    .cust-func-card {
                        padding: 15px;
                    }

                    .cust-func-card-title {
                        font-size: 1.5em;
                    }

                    .cust-func-form-input {
                        font-size: 0.9em;
                    }

                    .cust-func-loading-message,
                    .cust-func-error-message,
                    .cust-func-success-message {
                        padding: 8px;
                        font-size: 0.85em;
                    }
                }

                /* From Loan Submission Complete - Specific for this component if needed */
                .loan-application-page {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f0f2f5;
                    color: #333;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .loan-header {
                    background-color: #004085; /* Dark blue */
                    color: white;
                    padding: 20px 0;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    margin-bottom: 30px;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .logo-icon {
                    font-size: 2.5em;
                }

                .logo-text {
                    font-size: 1.8em;
                    font-weight: bold;
                }

                .header-title {
                    text-align: right;
                }

                .header-title h1 {
                    margin: 0;
                    font-size: 2.2em;
                }

                .header-title p {
                    margin: 5px 0 0;
                    font-size: 1em;
                    opacity: 0.9;
                }

                .dashboard-footer {
                    background-color: #f0f2f5;
                    padding: 20px;
                    text-align: center;
                    border-top: 1px solid #e0e0e0;
                    color: #555;
                    font-size: 0.9em;
                    margin-top: auto; /* Pushes footer to the bottom */
                }

                .footer-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }

                .footer-links a {
                    color: #007bff;
                    text-decoration: none;
                    margin: 0 10px;
                }

                .footer-links a:hover {
                    text-decoration: underline;
                }
            `}</style>
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

                                        return (
                                            <div key={tx.transaction_id} className={`transaction-item ${transactionTypeClass}`}>
                                                <div className="transaction-icon">{icon}</div>
                                                <div className="transaction-details">
                                                    <p className="transaction-amount">${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                    <p className="transaction-info">
                                                        {isDebit ? (
                                                            <>Transfer to: <strong>{formatAccountNoDisplay(tx.receiver_account_no)}</strong></>
                                                        ) : (
                                                            // For credit transactions, tx.initiator_account_id is the UUID of the *other* account.
                                                            // To show its actual account number, you'd need to fetch the account_no for tx.initiator_account_id.
                                                            // For now, it shows the masked receiver's account number (which is this account's number)
                                                            // or a generic message if initiator's account number can't be resolved easily.
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

                </footer>
            </div>
        </div>
    );
}