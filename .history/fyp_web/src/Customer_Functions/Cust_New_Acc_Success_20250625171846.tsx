// Cust_Function/Cust_New_CC_Success.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../shared/normalize.css';
// REMOVED: '../shared/Form.css'; // Assuming form styles are sufficient in Cust_Transfer.css
import '../Dashboard/CustomerDashboard.css'; // For general dashboard-specific layout (if any remains)
import { CheckCircle } from 'lucide-react';

// --- IMPORT THE REUSABLE HEADER AND THE MAIN STYLESHEET ---
import Header from '../shared/Header.tsx';
import './Cust_Transfer.css'; // This file provides all required styles


function Cust_New_CC_Success() {
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        navigate('/customer-dashboard');
    };

    return (
        <div className="main-app-wrapper">
            {/* Use the new Header component with a back button */}
            <Header showBackButton={true} backPath="/customer-dashboard" />

            <div className="container transactions-card status-success">
                <div className="completion-content">
                    <div className="completion-icon">
                        <CheckCircle size={80} color="#28a745" />
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