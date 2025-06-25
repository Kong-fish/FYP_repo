import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../shared/Header.css';
import '../shared/normalize.css';
import './Cust_Function.css';
import './CustomerDashboard.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';  
import Cust_Pass_Ver from '../../Cust_Function/Cust_Pass_Ver.tsx';

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const [customerInfo, setCustomerInfo] = useState({ firstName: '', lastLogin: '' });
    const [accounts, setAccounts] = useState([]);
    const [showBalances, setShowBalances] = useState(true);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [actionToPerform, setActionToPerform] = useState<(() => void) | null>(null); // Explicitly type actionToPerform
    const [verificationError, setVerificationError] = useState('');

    useEffect(() => {
        // Mock data fetching
        const fetchCustomerData = async () => {
            // Replace with actual API calls
            const mockCustomerInfo = {
                firstName: 'John',
                lastLogin: 'June 25, 2025 08:30 PM',
            };
            const mockAccounts = [
                { id: '1', type: 'Checking Account', number: '1234567890', balance: 1523.45, nickname: 'Main Checking' },
                { id: '2', type: 'Savings Account', number: '0987654321', balance: 5890.12, nickname: 'My Savings' },
                { id: '3', type: 'Credit Card', number: '1122334455', balance: -350.75, limit: 10000, nickname: 'Travel Card' },
                { id: '4', type: 'Checking Account', number: '5678901234', balance: 250.00, nickname: 'Spending' },

            ];
            setCustomerInfo(mockCustomerInfo);
            setAccounts(mockAccounts);
        };
        fetchCustomerData();
    }, []);

    const toggleShowBalances = () => {
        setShowBalances(!showBalances);
    };

    const openVerificationModal = (action: () => void) => {
        setActionToPerform(() => action); // Store the function to be called after verification
        setIsVerificationModalOpen(true);
        setVerificationError(''); // Clear any previous errors
    };

    const closeVerificationModal = () => {
        setIsVerificationModalOpen(false);
        setActionToPerform(null);
        setVerificationError('');
    };

    const handlePasswordVerify = async (password: string) => {
        // In a real application, you'd send this password to your backend for verification.
        // For this mock, we'll use a simple hardcoded check.
        const isPasswordCorrect = password === 'password123'; // Replace with actual verification logic

        if (isPasswordCorrect) {
            setVerificationError('');
            closeVerificationModal();
            if (actionToPerform) {
                actionToPerform(); // Execute the stored action
            }
        } else {
            setVerificationError('Incorrect password. Please try again.');
        }
    };

    // Quick Actions
    const handleTransferClick = () => {
        openVerificationModal(() => navigate('/transfer'));
    };

    const handleLoanApplyClick = () => {
        openVerificationModal(() => navigate('/loans/apply'));
    };

    const handleCreateAccountClick = () => {
        openVerificationModal(() => navigate('/accounts/create'));
    };

    // Sidebar Menu Actions
    const handleViewApplicationsClick = () => {
        openVerificationModal(() => navigate('/applications'));
    };

    const handleTransactionHistoryClick = () => {
        openVerificationModal(() => navigate('/transactions'));
    };

    const handleAccountSettingsClick = () => {
        openVerificationModal(() => navigate('/settings'));
    };

    // Account Card Click
    const handleViewAccountDetails = (accountId: string) => {
        openVerificationModal(() => navigate(`/accounts/${accountId}`));
    };

    // Mobile-only buttons - assuming these might also lead to sensitive areas
    const handleReportsClick = () => {
        openVerificationModal(() => navigate('/reports'));
    };

    const handleHistoryMobileClick = () => {
        openVerificationModal(() => navigate('/transactions')); // Already handled by transaction history, but added for completeness
    };

    const handleSettingsMobileClick = () => {
        openVerificationModal(() => navigate('/settings')); // Already handled by account settings, but added for completeness
    };


    return (
        <>
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
                                    {/* These mobile-only buttons now also trigger verification */}
                                    <button onClick={handleReportsClick} className="action-button mobile-only">
                                        <BarChart className="action-icon large-icon" size={30} />
                                        <span className="action-label">Reports</span>
                                    </button>
                                    <button onClick={handleHistoryMobileClick} className="action-button mobile-only">
                                        <History className="action-icon large-icon" size={30} />
                                        <span className="action-label">History</span>
                                    </button>
                                    <button onClick={handleSettingsMobileClick} className="action-button mobile-only">
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
                                                                {showBalances ? `****${account.number.slice(-4)}` : '************'}
                                                            </p>
                                                        </div>
                                                        <span className="account-icon">
                                                            {account.type === "Credit Card" && "💳"}
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
                verificationError={verificationError}
            />
        </>
    );
}