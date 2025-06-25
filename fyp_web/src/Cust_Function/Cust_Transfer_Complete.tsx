import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'; // Import CheckCircle for success, XCircle for failure

// Import shared CSS files
import '../shared/Header.css';
import '../shared/normalize.css';
import './CustFunction.css'; // For general customer function styling
import DarkModeToggle from '../shared/DarkModeToggle.tsx'; // Import DarkModeToggle component

// Re-use the Header component for consistency
interface HeaderProps {
    showBackButton?: boolean;
    backPath?: string;
    showSignOut?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, backPath = '/', showSignOut = true }) => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/'); // Redirect to customer landing after sign out
        }
    };

    const handleBack = () => {
        navigate(backPath); // Navigate to the specified backPath
    };

    return (
        <header className="header">
            <div className="header__content">
                {/* Back Button with text */}
                {showBackButton && (
                    <button onClick={handleBack} className="back-button">
                        <ArrowLeft size={24} />
                        <span className="back-button-text">Back</span>
                    </button>
                )}

                <div className="logo-section">
                    <h1 className="logo-text">Eminent Western</h1>
                </div>
                <nav className="header-nav"></nav>
                <div className="header-actions">
                    <DarkModeToggle /> {/* Reusing the DarkModeToggle component */}
                    {showSignOut && (
                        <button onClick={handleSignOut} className="sign-out-button header-sign-out-btn">
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default function Cust_Transfer_Complete() {
    const navigate = useNavigate();
    const location = useLocation();
    // Retrieve state passed from the previous page (e.g., Transfer page)
    const {
        amount = 'N/A',
        recipientName = 'N/A', // This should likely be recipientAccountNo or a formatted name
        transactionId = 'N/A', // Only available on success
        timestamp = new Date().toLocaleString(),
        status = 'failure', // Default to failure if status is not explicitly passed
        message = 'An unexpected error occurred.', // Message for failure
        typeOfTransfer = 'General Transfer' // Type of transfer, for context
    } = location.state || {};

    const isSuccess = status === 'success';

    const handleGoToDashboard = () => {
        navigate('/customer-dashboard');
    };

    const handleAnotherTransfer = () => {
        navigate('/customer-transfer'); // Assuming '/customer-transfer' is your transfer page route
    };

    return (
        <div className="main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            {/* Header: Always show back button to dashboard from this page */}
            <Header showBackButton={true} backPath="/customer-dashboard" showSignOut={true} />

            <div className="customer-function-container"> {/* Reusing customer-function-container */}
                <div className="customer-function-content"> {/* Reusing customer-function-content */}
                    <div className={`customer-card ${isSuccess ? 'success-card' : 'failure-card'}`}> {/* Dynamic class for card */}
                        <div className="customer-card-content" style={{ textAlign: 'center' }}>
                            {isSuccess ? (
                                <CheckCircle size={80} className="success-icon" />
                            ) : (
                                <XCircle size={80} className="failure-icon" />
                            )}
                            <h2 className="customer-card-title" style={{ color: isSuccess ? 'var(--green-success)' : 'var(--red-error)', marginBottom: '15px' }}>
                                {isSuccess ? 'Transfer Successful!' : 'Transfer Failed!'}
                            </h2>
                            <p className={isSuccess ? 'customer-success-message' : 'customer-error-message'} style={{ marginBottom: '30px', fontSize: '1.1em' }}>
                                {isSuccess ? 'Your transaction has been processed successfully.' : message}
                            </p>

                            <div className="transaction-details customer-confirmation-details"> {/* Reusing confirmation details styles */}
                                <h3>Transaction Summary</h3>
                                <div className="detail-item">
                                    <span>Amount:</span>
                                    <span className="detail-value">$ {parseFloat(amount).toFixed(2)}</span>
                                </div>
                                <div className="detail-item">
                                    <span>Type of Transfer:</span>
                                    <span className="detail-value">{typeOfTransfer}</span>
                                </div>
                                {/* Only show these details if the transfer was successful */}
                                {isSuccess && (
                                    <>
                                        <div className="detail-item">
                                            <span>Recipient:</span>
                                            <span className="detail-value">{recipientName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span>Transaction ID:</span>
                                            <span className="detail-value">{transactionId}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span>Date & Time:</span>
                                            <span className="detail-value">{timestamp}</span>
                                        </div>
                                    </>
                                )}
                                <div className="detail-item">
                                    <span>Status:</span>
                                    <span className={`detail-value ${isSuccess ? 'status-completed' : 'status-failed'}`}>
                                        {isSuccess ? 'Completed' : 'Failed'}
                                    </span>
                                </div>
                            </div>

                            <div className="customer-button-group"> {/* Reusing customer-button-group */}
                                <button
                                    onClick={handleGoToDashboard}
                                    className="customer-primary-button"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={handleAnotherTransfer}
                                    className="customer-secondary-button"
                                >
                                    Make Another Transfer
                                </button>
                            </div>
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
