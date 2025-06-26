import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'; // Import CheckCircle for success, XCircle for failure
import '../shared/normalize.css';
import './CustFunction.css'; // For general customer function styling

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
        <div className="cf-main-app-wrapper"> {/* Changed from main-app-wrapper */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <div className="cf-cust-func-container"> {/* Changed from customer-function-container */}
                <div className="cf-cust-func-content"> {/* Changed from customer-function-content */}
                    <div className={`cf-cust-func-card ${isSuccess ? 'cf-success-card' : 'cf-failure-card'}`}> {/* Changed from customer-card and added cf- prefix to status cards */}
                        <div className="cf-cust-func-card-content" style={{ textAlign: 'center' }}> {/* Changed from customer-card-content */}
                            {isSuccess ? (
                                <CheckCircle size={80} className="cf-success-icon" /> {/* Changed from success-icon */}
                            ) : (
                                <XCircle size={80} className="cf-failure-icon" />
                            )}
                            <h2 className="cf-cust-func-card-title" style={{ color: isSuccess ? 'var(--cf-green-success)' : 'var(--cf-red-error)', marginBottom: '15px' }}> {/* Changed from customer-card-title and cf- prefix for variables */}
                                {isSuccess ? 'Transfer Successful!' : 'Transfer Failed!'}
                            </h2>
                            <p className={isSuccess ? 'cf-cust-func-success-message' : 'cf-cust-func-error-message'} style={{ marginBottom: '30px', fontSize: '1.1em' }}> {/* Changed from customer-success-message / customer-error-message */}
                                {isSuccess ? 'Your transaction has been processed successfully.' : message}
                            </p>

                            <div className="cf-cust-func-confirmation-details"> {/* Changed from transaction-details customer-confirmation-details */}
                                <h3>Transaction Summary</h3>
                                <div className="cf-detail-item"> {/* Changed from detail-item */}
                                    <span>Amount:</span>
                                    <span className="cf-detail-value">$ {parseFloat(amount).toFixed(2)}</span> {/* Changed from detail-value */}
                                </div>
                                <div className="cf-detail-item"> {/* Changed from detail-item */}
                                    <span>Type of Transfer:</span>
                                    <span className="cf-detail-value">{typeOfTransfer}</span> {/* Changed from detail-value */}
                                </div>
                                {/* Only show these details if the transfer was successful */}
                                {isSuccess && (
                                    <>
                                        <div className="cf-detail-item"> {/* Changed from detail-item */}
                                            <span>Recipient:</span>
                                            <span className="cf-detail-value">{recipientName}</span> {/* Changed from detail-value */}
                                        </div>
                                        <div className="cf-detail-item"> {/* Changed from detail-item */}
                                            <span>Transaction ID:</span>
                                            <span className="cf-detail-value">{transactionId}</span> {/* Changed from detail-value */}
                                        </div>
                                        <div className="cf-detail-item"> {/* Changed from detail-item */}
                                            <span>Date & Time:</span>
                                            <span className="cf-detail-value">{timestamp}</span> {/* Changed from detail-value */}
                                        </div>
                                    </>
                                )}
                                <div className="cf-detail-item"> {/* Changed from detail-item */}
                                    <span>Status:</span>
                                    <span className={`cf-detail-value ${isSuccess ? 'cf-status-completed' : 'cf-status-failed'}`}> {/* Changed from detail-value and status classes */}
                                        {isSuccess ? 'Completed' : 'Failed'}
                                    </span>
                                </div>
                            </div>

                            <div className="cf-cust-func-button-group"> {/* Changed from customer-button-group */}
                                <button
                                    onClick={handleGoToDashboard}
                                    className="cf-cust-func-primary-button" {/* Changed from customer-primary-button */}
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={handleAnotherTransfer}
                                    className="cf-cust-func-secondary-button" {/* Changed from customer-secondary-button */}
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