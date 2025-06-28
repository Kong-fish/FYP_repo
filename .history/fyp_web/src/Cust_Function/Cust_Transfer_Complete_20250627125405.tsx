import React, { useEffect } from 'react'; // Added useEffect
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import '../shared/normalize.css';
import './CustFunction.css';

export default function Cust_Transfer_Complete() {
    const navigate = useNavigate();
    const location = useLocation();

    // Log the entire location object and its state when the component renders
    console.log('Cust_Transfer_Complete rendered. Location:', location);
    console.log('Cust_Transfer_Complete location.state:', location.state);

    // Destructure state with default values
    const {
        amount = 'N/A',
        recipientName = 'N/A',
        transactionId = 'N/A',
        timestamp = new Date().toLocaleString(),
        status = 'failure', // Default to failure if status is not explicitly passed
        message = 'An unexpected error occurred during transfer completion.', // Message for failure
        typeOfTransfer = 'General Transfer' // Type of transfer, for context
    } = location.state || {};

    const isSuccess = status === 'success';

    // useEffect to log when the component mounts and to observe state changes
    useEffect(() => {
        console.log('Cust_Transfer_Complete mounted. Final state received:', location.state);
        // Optional: Set a timeout to see if the component remains mounted
        const mountCheckTimer = setTimeout(() => {
            console.log('Cust_Transfer_Complete is still mounted after 3 seconds.');
        }, 3000);

        return () => {
            console.log('Cust_Transfer_Complete unmounted.');
            clearTimeout(mountCheckTimer); // Clean up the timer
        };
    }, [location.state]); // Rerun if location.state changes

    const handleGoToDashboard = () => {
        navigate('/customer-dashboard');
    };

    const handleAnotherTransfer = () => {
        navigate('/customer-transfer');
    };

    return (
        <div className="cf-main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <div className="cf-cust-func-container">
                <div className="cf-cust-func-content">
                    <div className={`cf-cust-func-card ${isSuccess ? 'cf-success-card' : 'cf-failure-card'}`}>
                        <div className="cf-cust-func-card-content" style={{ textAlign: 'center' }}>
                            {isSuccess ? (
                                <CheckCircle size={80} className="cf-success-icon" />
                            ) : (
                                <XCircle size={80} className="cf-failure-icon" />
                            )}
                            <h2 className="cf-cust-func-card-title" style={{ color: isSuccess ? 'var(--cf-green-success)' : 'var(--cf-red-error)', marginBottom: '15px' }}>
                                {isSuccess ? 'Transfer Successful!' : 'Transfer Failed!'}
                            </h2>
                            <p className={isSuccess ? 'cf-cust-func-success-message' : 'cf-cust-func-error-message'} style={{ marginBottom: '30px', fontSize: '1.1em' }}>
                                {isSuccess ? 'Your transaction has been processed successfully.' : message}
                            </p>

                            <div className="cf-cust-func-confirmation-details">
                                <h3>Transaction Summary</h3>
                                <div className="cf-detail-item">
                                    <span>Amount:</span>
                                    <span className="cf-detail-value">$ {parseFloat(amount).toFixed(2)}</span>
                                </div>
                                <div className="cf-detail-item">
                                    <span>Type of Transfer:</span>
                                    <span className="cf-detail-value">{typeOfTransfer}</span>
                                </div>
                                {/* Only show these details if the transfer was successful */}
                                {isSuccess && (
                                    <>
                                        <div className="cf-detail-item">
                                            <span>Recipient:</span>
                                            <span className="cf-detail-value">{recipientName}</span>
                                        </div>
                                        <div className="cf-detail-item">
                                            <span>Transaction ID:</span>
                                            <span className="cf-detail-value">{transactionId}</span>
                                        </div>
                                        <div className="cf-detail-item">
                                            <span>Date & Time:</span>
                                            <span className="cf-detail-value">{timestamp}</span>
                                        </div>
                                    </>
                                )}
                                <div className="cf-detail-item">
                                    <span>Status:</span> {/* Added Status label */}
                                    <span className={`cf-detail-value ${isSuccess ? 'cf-status-completed' : 'cf-status-failed'}`}>
                                        {isSuccess ? 'Completed' : 'Failed'}
                                    </span>
                                </div>
                            </div>

                            <div className="cf-cust-func-button-group">
                                <button
                                    onClick={handleGoToDashboard}
                                    className="cf-cust-func-primary-button"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={handleAnotherTransfer}
                                    className="cf-cust-func-secondary-button"
                                >
                                    Make Another Transfer
                                </button>
                            </div>
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
    );
}
