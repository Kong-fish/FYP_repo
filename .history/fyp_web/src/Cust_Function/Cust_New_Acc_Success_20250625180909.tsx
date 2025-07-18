import React from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import '../Dashboard/CustomerDashboard.css';
import '../shared/normalize.css';
import '../shared/Header.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';
import { FaCheckCircle } from 'react-icons/fa'; // or use 'react-icons/md' for Material icons


function Cust_New_Acc_Success() {
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        navigate('/customer-dashboard');
    };

    return (
        <div className="main-app-wrapper">
            <div className="header">
                <button className="back-button" onClick={() => navigate('/customer-dashboard')}>
                    Back
                </button>
                <h1 className="logo-text">Eminent Western</h1>
            </div>

            <div className="container transactions-card status-success">
                <div className="completion-content">
                    <div className="completion-icon">
                        <FaCheckCircle size={80} color="#28a745" />
                    </div>
                    <h2 className="transactions-title">Credit Card Application Submitted!</h2>
                    <p className="completion-text">
                        Thank you for applying for a new credit card with Eminent Western. Your application has been successfully submitted and is now pending review.
                    </p>
                    <p className="completion-text">
                        We will notify you of the status of your application via email within 3-5 business days. You can also check the status under your "My Applications" section on the dashboard.
                    </p>
                    <button onClick={handleGoToDashboard} className="primary-button">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Cust_New_Acc_Success;