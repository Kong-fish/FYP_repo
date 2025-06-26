import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './CustFunction.css';

export default function CustomerNewBankAccComplete() { // Renamed component
    const navigate = useNavigate(); // Initialize useNavigate

    const handleViewApprovalsClick = () => {
        navigate('/customer-view-approval'); // Navigate to the specified route
    };

    return (
        <div className="loan-application-page"> {/* Reusing the same page styling class */}
            <header className="loan-header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo-section">
                            {/* Using a placeholder image for demonstration */}
                            <img src="https://placehold.co/150x50/cccccc/333333?text=Logo" alt="Eminent Western Logo" className="logo-image"
                                onError={(e) => { e.currentTarget.src = "https://placehold.co/150x50/cccccc/333333?text=Logo"; }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container">
                <div className="form-section success-page-section"> {/* Added a new class for specific styling */}
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h2>Bank Account Application Submitted Successfully!</h2> {/* Updated text */}
                        <p>Thank you for your bank account application. We have received your submission and will review it shortly.</p>
                        <p>You will receive an email notification regarding the status of your application within 1-2 business days.</p>
                        {/* Button to navigate to the Customer View Approval page */}
                        <button onClick={handleViewApprovalsClick} className="btn-primary">
                            View My Bank Account Approvals
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}