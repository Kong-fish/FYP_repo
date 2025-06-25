"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import { ArrowLeft } from 'lucide-react';

import '../shared/Header.css';
import '../shared/normalize.css';
import './CustFunction.css'; // For general styling of forms, cards, buttons
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

// Interface for account information
interface AccountInfo {
    account_id: string;
    account_no: string;
    account_type: string;
    balance: number;
    nickname?: string;
}

export default function Cust_Transfer() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<AccountInfo[]>([]);
    const [fromAccount, setFromAccount] = useState<string>('');
    const [toAccountNo, setToAccountNo] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [purpose, setPurpose] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    const [confirmationDetails, setConfirmationDetails] = useState<any>(null);

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

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and a single decimal point
        const value = e.target.value;
        const regex = /^\d*\.?\d*$/;
        if (value === '' || regex.test(value)) {
            setAmount(value);
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null); // Clear previous success message

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
            .select('account_id, account_no, balance, account_type')
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

        setConfirmationDetails({
            fromAccount: `${selectedFromAccount.account_type} (****${selectedFromAccount.account_no.slice(-4)})`,
            toAccount: `${recipientAccount.account_type} (****${recipientAccount.account_no.slice(-4)})`,
            amount: transferAmount,
            purpose: purpose || 'N/A',
            recipientAccountId: recipientAccount.account_id // Pass recipient ID for actual transaction
        });
        setShowConfirmation(true);
    };

    const confirmTransfer = async () => {
        setLoading(true);
        setError(null);

        if (!confirmationDetails) {
            setError("Confirmation details missing.");
            setLoading(false);
            setShowConfirmation(false);
            return;
        }

        const { fromAccount: fromAccDisplay, toAccount: toAccDisplay, amount: transferAmount, purpose: transPurpose, recipientAccountId } = confirmationDetails;

        try {
            // Perform the transaction
            const { error: transactionError } = await supabase.rpc('perform_transfer', {
                p_initiator_account_id: fromAccount,
                p_receiver_account_id: recipientAccountId,
                p_amount: transferAmount,
                p_purpose: transPurpose,
                p_type_of_transfer: 'Customer Transfer' // Example type
            });

            if (transactionError) {
                console.error('Error performing transfer:', transactionError.message);
                throw new Error(`Transfer failed: ${transactionError.message}`);
            }

            setSuccessMessage('Transfer completed successfully!');
            // Reset form and confirmation details
            setFromAccount(accounts.length > 0 ? accounts[0].account_id : '');
            setToAccountNo('');
            setAmount('');
            setPurpose('');
            setShowConfirmation(false);
            // Optionally, refresh accounts data to show updated balance
            const { data: updatedAccountsData, error: updatedAccountsError } = await supabase
                .from('Account')
                .select('account_id, account_no, account_type, balance, nickname')
                .eq('customer_id', (await supabase.from('Customer').select('customer_id').eq('user_uuid', (await supabase.auth.getSession()).data.session?.user.id).single()).data?.customer_id);

            if (!updatedAccountsError && updatedAccountsData) {
                setAccounts(updatedAccountsData as AccountInfo[]);
            }

        } catch (err: any) {
            console.error('Error confirming transfer:', err.message);
            setError(`Error: ${err.message}`);
            setShowConfirmation(false); // Hide confirmation on error
        } finally {
            setLoading(false);
        }
    };

    const cancelTransfer = () => {
        setShowConfirmation(false);
        setConfirmationDetails(null);
    };

    if (loading && !showConfirmation) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="dashboard-container">
                    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="loading-message">Loading accounts...</p>
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
                        <div className="main-content">
                            <div className="transactions-card">
                                <div className="transactions-content">
                                    <div className="transactions-header">
                                        <h2 className="transactions-title">Money Transfer</h2>
                                    </div>

                                    {error && (
                                        <div className="error-message-box">
                                            {error}
                                        </div>
                                    )}
                                    {successMessage && (
                                        <div className="success-message" style={{ color: 'var(--success-color)', marginBottom: '1rem', textAlign: 'center' }}>
                                            {successMessage}
                                        </div>
                                    )}

                                    {!showConfirmation ? (
                                        <form onSubmit={handleTransfer} className="transfer-form">
                                            <div className="form-group">
                                                <label htmlFor="fromAccount" className="form-label">From Account:</label>
                                                <select
                                                    id="fromAccount"
                                                    name="fromAccount"
                                                    value={fromAccount}
                                                    onChange={(e) => setFromAccount(e.target.value)}
                                                    className="form-input"
                                                    required
                                                >
                                                    {accounts.length === 0 && <option value="">No accounts available</option>}
                                                    {accounts.map(account => (
                                                        <option key={account.account_id} value={account.account_id}>
                                                            {account.account_type} (****{account.account_no.slice(-4)}) - Balance: ${account.balance?.toLocaleString()}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="toAccountNo" className="form-label">To Account Number:</label>
                                                <input
                                                    type="text"
                                                    id="toAccountNo"
                                                    name="toAccountNo"
                                                    value={toAccountNo}
                                                    onChange={(e) => setToAccountNo(e.target.value)}
                                                    className="form-input"
                                                    placeholder="Enter recipient's full account number"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="amount" className="form-label">Amount:</label>
                                                <input
                                                    type="text" // Use text to control input more precisely
                                                    id="amount"
                                                    name="amount"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    className="form-input"
                                                    placeholder="e.g., 100.00"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="purpose" className="form-label">Purpose (Optional):</label>
                                                <input
                                                    type="text"
                                                    id="purpose"
                                                    name="purpose"
                                                    value={purpose}
                                                    onChange={(e) => setPurpose(e.target.value)}
                                                    className="form-input"
                                                    placeholder="e.g., Monthly Rent"
                                                />
                                            </div>

                                            <div className="button-group">
                                                <button type="submit" className="primary-button" disabled={loading}>
                                                    Next: Confirm Transfer
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="confirmation-section">
                                            <h3>Confirm Transfer Details</h3>
                                            <div className="confirmation-details">
                                                <p><strong>From Account:</strong> {confirmationDetails.fromAccount}</p>
                                                <p><strong>To Account:</strong> {confirmationDetails.toAccount}</p>
                                                <p><strong>Amount:</strong> ${confirmationDetails.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                <p><strong>Purpose:</strong> {confirmationDetails.purpose}</p>
                                            </div>
                                            <p className="warning-text">
                                                Please double-check the details above. This action cannot be undone.
                                            </p>
                                            <div className="button-group" style={{ justifyContent: 'center' }}>
                                                <button onClick={cancelTransfer} className="secondary-button" disabled={loading}>
                                                    Cancel
                                                </button>
                                                <button onClick={confirmTransfer} className="primary-button" disabled={loading}>
                                                    {loading ? 'Processing...' : 'Confirm & Transfer'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
function setSuccessMessage(arg0: null) {
    throw new Error('Function not implemented.');
}

