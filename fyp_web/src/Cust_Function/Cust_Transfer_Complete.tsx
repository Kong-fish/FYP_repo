import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import { ArrowLeft, CheckCircle } from 'lucide-react'; // Import icons

// Import shared CSS files
import '../shared/Header.css';
import '../shared/normalize.css';
import './Cust_Function.css'; // Specific styles for customer functions

import DarkModeToggle from '../shared/DarkModeToggle'; // Assuming this is a separate component

// Re-use the Header component for consistency across pages
interface HeaderProps {
    showBackButton?: boolean;
    backPath?: string;
    showSignOut?: boolean; // Added prop for sign out button
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, backPath = '/', showSignOut = true }) => {
    const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/customer-landing'); // Redirect to customer landing after sign out
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
    // This is an example, you might pass real transaction data here
    const {
        amount = 'N/A',
        recipientName = 'N/A',
        transactionId = 'N/A',
        timestamp = new Date().toLocaleString(),
        status = 'Completed'
    } = location.state || {};

    const handleGoToDashboard = () => {
        navigate('/customer-dashboard');
    };

    const handleAnotherTransfer = () => {
        navigate('/customer-transfer'); // Assuming '/customer-transfer' is your transfer page route
    };

    return (
        <div className="main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            {/* Header: Show back button to dashboard, hide sign out for confirmation page clarity */}
            <Header showBackButton={true} backPath="/customer-dashboard" showSignOut={true} />

            <div className="dashboard-container">
                <div className="dashboard-main container">
                    <div className="dashboard-layout">
                        <div className="main-content" style={{ maxWidth: '600px', margin: '0 auto', width: '95%' }}>
                            <div className="transactions-card success-card"> {/* Added success-card class */}
                                <div className="transactions-content" style={{ textAlign: 'center' }}>
                                    <CheckCircle size={80} className="success-icon" />
                                    <h2 className="transactions-title" style={{ color: 'var(--success-color)', marginBottom: '15px' }}>
                                        Transfer Successful!
                                    </h2>
                                    <p className="success-message" style={{ marginBottom: '30px', fontSize: '1.1em' }}>
                                        Your transaction has been processed successfully.
                                    </p>

                                    <div className="transaction-details">
                                        <h3>Transaction Summary</h3>
                                        <div className="detail-item">
                                            <span>Amount:</span>
                                            <span className="detail-value">$ {parseFloat(amount).toFixed(2)}</span>
                                        </div>
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
                                        <div className="detail-item">
                                            <span>Status:</span>
                                            <span className="detail-value status-completed">{status}</span>
                                        </div>
                                    </div>

                                    <div className="action-buttons-group">
                                        <button
                                            onClick={handleGoToDashboard}
                                            className="primary-button"
                                        >
                                            Go to Dashboard
                                        </button>
                                        <button
                                            onClick={handleAnotherTransfer}
                                            className="secondary-button"
                                            style={{ marginLeft: '15px' }}
                                        >
                                            Make Another Transfer
                                        </button>
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