import React from 'react';
import './CustFunction.css';


interface LoanSubmissionCompleteProps {
  onViewApprovalsClick: () => void;
}

export default function LoanSubmissionComplete({ onViewApprovalsClick }: LoanSubmissionCompleteProps) {
  return (
    <div className="loan-application-page"> {/* Reusing the same page styling class */}
      <header className="loan-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <img src="/white.png" alt="Eminent Western Logo" className="logo-image" />
            </div>
            <div className="header-title">
              <h1>Loan Application</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="form-section success-page-section"> {/* Added a new class for specific styling */}
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Loan Application Submitted Successfully!</h2>
            <p>Thank you for your loan application. We have received your submission and will review it shortly.</p>
            <p>You will receive an email notification regarding the status of your application within 1-2 business days.</p>
            {/* Button to navigate to the Customer View Approval page */}
            <button onClick={onViewApprovalsClick} className="btn-primary">
              View My Bank Account Approvals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
