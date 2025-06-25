import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import supabase from '../supabaseClient.js';


// Define the interface for a Loan Application, ensuring types match your Supabase schema
interface LoanApplication {
  loan_id: number;
  customer_id: string;
  customer_annual_income: number | null;
  customer_job_company_name: string | null;
  customer_job_title: string | null;
  customer_job_years: number | null;
  customer_home_ownership: string | null;
  loan_intent: string | null;
  loan_grade: string | null;
  loan_interest_rate: number | null;
  customer_credit_score: number | null;
  customer_credit_history_years: number | null;
  customer_default: boolean | null;
  application_date: string;
  ai_prediction: any | null; // JSON type from Supabase
  final_approval: boolean | null;
  loan_amount: number | null;
  account_number: string | null;
  Customer: { // Nested Customer object from the join
    first_name: string;
    last_name: string;
    username: string;
    phone_no: string;
  } | null;
}

const LoanApplicationView: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>(); // Get loanId from URL parameters
  const navigate = useNavigate(); // Hook for navigation

  // State variables for loan details, loading status, and errors
  const [loanDetails, setLoanDetails] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingApproval, setIsUpdatingApproval] = useState<boolean>(false); // State for approval/rejection loading

  /**
   * Fetches the loan details from Supabase based on the loanId in the URL.
   * This effect runs when the component mounts or when loanId changes.
   */
  useEffect(() => {
    const fetchLoanDetails = async () => {
      // Validate loanId presence
      if (!loanId) {
        setError("Loan ID not provided in the URL.");
        setLoading(false);
        return;
      }

      setLoading(true); // Set loading to true before fetching
      setError(null); // Clear any previous errors

      try {
        // Attempt to parse loanId to an integer. If it's not a valid number, it will be NaN.
        const parsedLoanId = parseInt(loanId);
        if (isNaN(parsedLoanId)) {
          setError("Invalid Loan ID format.");
          setLoading(false);
          return;
        }

        // Supabase query to fetch loan details and associated customer information
        const { data, error } = await supabase
          .from('Loan')
          .select(`
            loan_id,
            customer_id,
            customer_annual_income,
            customer_job_company_name,
            customer_job_title,
            customer_job_years,
            customer_home_ownership,
            loan_intent,
            loan_grade,
            loan_interest_rate,
            customer_credit_score,
            customer_credit_history_years,
            customer_default,
            application_date,
            ai_prediction,
            final_approval,
            loan_amount,
            account_number,
            Customer (first_name, last_name, username, phone_no)
          `)
          .eq('loan_id', parsedLoanId) // Filter by the parsed loan ID
          .single(); // Expect a single record

        if (error) {
          throw error; // Propagate any Supabase errors
        }

        if (data) {
          // Supabase's .single() typically returns the related Customer as an object.
          // If for some reason it's an array (e.g., a complex join issue), take the first element.
          setLoanDetails({
            ...data,
            Customer: Array.isArray(data.Customer) ? data.Customer[0] : data.Customer,
          });
        } else {
          // No data found for the given loan ID
          setError("Loan application not found for this ID.");
        }
      } catch (err: any) {
        console.error("Error fetching loan details:", err);
        setError(err.message || "Failed to load loan details.");
      } finally {
        setLoading(false); // Set loading to false after fetch attempt
      }
    };

    fetchLoanDetails(); // Call the fetch function
  }, [loanId]); // Re-run effect when loanId changes

  /**
   * Handles navigation back to the admin dashboard.
   */
  const handleBackToDashboard = () => {
    navigate('/admin-dashboard');
  };

  /**
   * Handles the approval or rejection of a loan application.
   * @param approvalStatus Boolean indicating whether to approve (true) or reject (false) the loan.
   */
  const handleLoanApproval = async (approvalStatus: boolean) => {
    if (!loanDetails) return; // Do nothing if loan details are not loaded
    setIsUpdatingApproval(true); // Set approval update loading state

    try {
      // Update the final_approval status in the Loan table
      const { error } = await supabase
        .from('Loan')
        .update({ final_approval: approvalStatus })
        .eq('loan_id', loanDetails.loan_id); // Identify the loan by its ID

      if (error) {
        throw error; // Propagate any Supabase errors
      }

      // If successful, update the local state to reflect the change
      setLoanDetails(prevDetails => prevDetails ? { ...prevDetails, final_approval: approvalStatus } : null);
      // Optionally, navigate back to the dashboard or show a success message
      // navigate('/admin-dashboard');
      alert(`Loan ${approvalStatus ? 'approved' : 'rejected'} successfully!`); // Use a custom modal in production instead of alert
    } catch (err: any) {
      console.error("Error updating loan approval status:", err);
      setError(`Failed to ${approvalStatus ? 'approve' : 'reject'} loan: ${err.message}`);
      alert(`Failed to ${approvalStatus ? 'approve' : 'reject'} loan: ${err.message}`); // Use a custom modal
    } finally {
      setIsUpdatingApproval(false); // Reset approval update loading state
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="loan-view-container loading">
        <p>Loading loan details...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="loan-view-container error-message">
        <p>Error: {error}</p>
        <button onClick={handleBackToDashboard}>Back to Dashboard</button>
      </div>
    );
  }

  // Render no data state after loading
  if (!loanDetails) {
    return (
      <div className="loan-view-container no-data">
        <p>No loan details available for this ID.</p>
        <button onClick={handleBackToDashboard}>Back to Dashboard</button>
      </div>
    );
  }

  // Helper function to determine the CSS class for the approval badge
  const getApprovalStatusClass = (status: boolean | null) => {
    if (status === true) return 'approved';
    if (status === false) return 'rejected';
    return 'pending';
  };

  return (
    <div className="loan-view-container">
      {/* Embedded CSS for LoanApplicationView.css */}
      <style>{`
        /* LoanApplicationView.css */

        /* Define CSS Variables for Light Mode */
        :root {
            --background-color-light: #ffffff;
            --text-color: #333333;
            --text-color-heading: #1a1a1a;
            --shadow-small: 0 2px 5px rgba(0, 0, 0, 0.1);
            --shadow-large: 0 5px 15px rgba(0, 0, 0, 0.2);
            --border-color: #e0e0e0;
            --header-bg-color: #f0f0f0;
            --header-text-color: #333333;
            --table-row-even-bg: #f8f8f8;
            --table-row-hover-bg: #f2f2f2;
            --primary-button-bg: #007bff;
            --primary-button-text: #ffffff;
            --primary-button-hover-bg: #0056b3;
            --color-success: #28a745;
            --color-warning: #ffc107;
            --color-error: #dc3545;
            --code-bg-color: #f5f5f5;
            --code-text-color: #333333;
        }

        /* Dark mode variables */
        body.dark-mode {
            --background-color-light: #2c2c2c;
            --text-color: #e0e0e0;
            --text-color-heading: #ffffff;
            --shadow-small: 0 2px 5px rgba(0, 0, 0, 0.4);
            --shadow-large: 0 5px 15px rgba(0, 0, 0, 0.6);
            --border-color: #444;
            --header-bg-color: #4a4a4a;
            --header-text-color: #ffffff;
            --table-row-even-bg: #383838;
            --table-row-hover-bg: #555;
            --primary-button-bg: #007bff; /* You might want different button colors for dark mode */
            --primary-button-text: #ffffff;
            --primary-button-hover-bg: #0056b3;
            --color-success: #28a745; /* You might want different badge colors for dark mode */
            --color-warning: #ffc107;
            --color-error: #dc3545;
            --code-bg-color: #1e1e1e;
            --code-text-color: #d4d4d4;
        }

        /* Base container styling */
        .loan-view-container {
            padding: 20px;
            max-width: 1200px;
            margin: 20px auto;
            background-color: var(--background-color-light); /* Assuming dark mode toggle changes this */
            border-radius: 8px;
            box-shadow: var(--shadow-small);
            color: var(--text-color);
        }

        .loan-view-container h2 {
            text-align: center;
            margin-bottom: 25px;
            color: var(--text-color-heading);
        }

        .error-message {
            color: var(--color-error);
            font-weight: bold;
            text-align: center;
        }

        /* Loading and no data states */
        .loan-view-container.loading,
        .loan-view-container.error-message,
        .loan-view-container.no-data {
            text-align: center;
            padding: 50px;
            font-size: 1.1rem;
            color: var(--text-color);
        }

        .loan-view-container.error-message p {
            color: var(--color-error);
            font-weight: 600;
        }

        /* Page title */
        .page-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #385A93; /* A strong blue for titles */
          margin-bottom: 25px;
          text-align: center;
          border-bottom: 2px solid rgba(56, 90, 147, 0.2);
          padding-bottom: 15px;
        }

        body.dark-mode .page-title {
          color: #6366f1; /* Brighter indigo for dark mode titles */
          border-bottom-color: rgba(99, 102, 241, 0.3);
        }

        /* Back button */
        .back-button {
          position: absolute;
          top: 20px;
          left: 20px;
          background-color: #f0f0f0;
          border: 1px solid #d1d5db;
          color: #4a5568;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        body.dark-mode .back-button {
          background-color: #4a5568;
          border-color: #64748b;
          color: #cbd5e0;
        }

        .back-button:hover {
          background-color: #e2e8f0;
          border-color: #9ca3af;
          color: #1a202c;
        }

        body.dark-mode .back-button:hover {
          background-color: #64748b;
          border-color: #718096;
          color: #e2e8f0;
        }

        .back-button svg {
          margin-right: 5px;
        }

        /* Loan details card */
        .loan-details-card {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px 30px;
          padding: 20px;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          background-color: var(--background-color-light);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        body.dark-mode .loan-details-card {
          border-color: #4a5568;
          background-color: #1a202c;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .detail-group {
          display: flex;
          flex-direction: column;
          padding: 10px 0;
          border-bottom: 1px dashed var(--border-color);
        }

        body.dark-mode .detail-group {
          border-bottom-color: #4a5568;
        }

        .detail-group:last-child,
        .ai-prediction-group {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: var(--text-color-heading);
          margin-bottom: 5px;
          font-size: 0.95rem;
        }

        body.dark-mode .detail-label {
          color: #cbd5e0;
        }

        .detail-value {
          font-size: 1rem;
          color: var(--text-color);
          word-wrap: break-word;
        }

        body.dark-mode .detail-value {
          color: #e2e8f0;
        }

        /* Specific styling for AI Prediction */
        .ai-prediction-group {
          grid-column: 1 / -1;
          background-color: var(--code-bg-color);
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .ai-prediction-group {
          background-color: #2d3748;
          border-color: #4a5568;
        }

        .ai-prediction-group pre {
          background-color: var(--code-bg-color);
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
          font-size: 0.85rem;
          color: var(--code-text-color);
        }

        body.dark-mode .ai-prediction-group pre {
          background-color: #1a202c;
          color: #e2e8f0;
        }

        /* Status Badges */
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .status-badge.approved {
          background-color: #d1fae5;
          color: #065f46;
        }

        body.dark-mode .status-badge.approved {
          background-color: #10b981;
          color: #ecfdf5;
        }

        .status-badge.rejected {
          background-color: #fee2e2;
          color: #991b1b;
        }

        body.dark-mode .status-badge.rejected {
          background-color: #ef4444;
          color: #fef2f2;
        }

        .status-badge.pending {
          background-color: #fffbeb;
          color: #b45309;
        }

        body.dark-mode .status-badge.pending {
          background-color: #f59e0b;
          color: #fffdf5;
        }

        /* Action Buttons for Approve/Reject */
        .action-buttons-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
        }

        .action-button {
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .approve-button {
          background-color: #10b981;
          color: white;
        }

        .approve-button:hover {
          background-color: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .reject-button {
          background-color: #ef4444;
          color: white;
        }

        .reject-button:hover {
          background-color: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .loan-view-container {
            margin: 20px;
            padding: 20px;
          }

          .page-title {
            font-size: 1.8rem;
            padding-top: 30px;
          }

          .back-button {
            top: 15px;
            left: 15px;
            padding: 8px 12px;
            font-size: 0.85rem;
          }

          .loan-details-card {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .detail-label,
          .detail-value {
            font-size: 0.9rem;
          }

          .action-buttons-container {
            flex-direction: column;
            gap: 10px;
          }

          .action-button {
            width: 100%;
            font-size: 1rem;
            padding: 10px 20px;
          }
        }

        @media (max-width: 480px) {
          .loan-view-container {
            margin: 15px;
            padding: 15px;
          }

          .page-title {
            font-size: 1.5rem;
            padding-top: 25px;
          }
        }
      `}</style>

      {/* Back button to navigate to the dashboard */}
      <button className="back-button" onClick={handleBackToDashboard}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      {/* Page title with truncated Loan ID */}
      <h2 className="page-title">Loan Application Details (ID: {String(loanDetails.loan_id).substring(0, 8)}...)</h2>

      {/* Main card displaying loan details */}
      <div className="loan-details-card">
        {/* Customer Information */}
        <div className="detail-group">
          <p className="detail-label">Customer Name:</p>
          <p className="detail-value">{loanDetails.Customer?.first_name} {loanDetails.Customer?.last_name}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Customer Email:</p>
          <p className="detail-value">{loanDetails.Customer?.username}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Customer Phone:</p>
          <p className="detail-value">{loanDetails.Customer?.phone_no}</p>
        </div>

        {/* Loan Details */}
        <div className="detail-group">
          <p className="detail-label">Loan Amount:</p>
          <p className="detail-value">${loanDetails.loan_amount?.toLocaleString()}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Loan Intent:</p>
          <p className="detail-value">{loanDetails.loan_intent}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Application Date:</p>
          <p className="detail-value">{new Date(loanDetails.application_date).toLocaleString()}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Final Approval:</p>
          <p className="detail-value">
            <span className={`status-badge ${getApprovalStatusClass(loanDetails.final_approval)}`}>
              {loanDetails.final_approval === true ? 'Approved' :
               loanDetails.final_approval === false ? 'Rejected' : 'Pending'}
            </span>
          </p>
        </div>

        {/* Financial and Job Details */}
        <div className="detail-group">
          <p className="detail-label">Annual Income:</p>
          <p className="detail-value">${loanDetails.customer_annual_income?.toLocaleString()}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Job Title:</p>
          <p className="detail-value">{loanDetails.customer_job_title}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Company:</p>
          <p className="detail-value">{loanDetails.customer_job_company_name}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Years at Job:</p>
          <p className="detail-value">{loanDetails.customer_job_years}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Home Ownership:</p>
          <p className="detail-value">{loanDetails.customer_home_ownership}</p>
        </div>

        {/* Loan Grade and Interest Rate */}
        <div className="detail-group">
          <p className="detail-label">Loan Grade:</p>
          <p className="detail-value">{loanDetails.loan_grade}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Interest Rate:</p>
          <p className="detail-value">{loanDetails.loan_interest_rate}%</p>
        </div>

        {/* Credit Information */}
        <div className="detail-group">
          <p className="detail-label">Credit Score:</p>
          <p className="detail-value">{loanDetails.customer_credit_score}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Credit History (Years):</p>
          <p className="detail-value">{loanDetails.customer_credit_history_years}</p>
        </div>
        <div className="detail-group">
          <p className="detail-label">Customer Defaulted:</p>
          <p className="detail-value">{loanDetails.customer_default ? 'Yes' : 'No'}</p>
        </div>

        {/* Account Information */}
        <div className="detail-group">
          <p className="detail-label">Account Number:</p>
          <p className="detail-value">{loanDetails.account_number}</p>
        </div>

        {/* AI Prediction (if available) */}
        {loanDetails.ai_prediction && (
          <div className="ai-prediction-group">
            <p className="detail-label">AI Prediction:</p>
            {/* Display AI prediction JSON in a preformatted block */}
            <pre className="detail-value">{JSON.stringify(loanDetails.ai_prediction, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Action buttons for approving/rejecting the loan */}
      <div className="action-buttons-container">
        <button
          className="action-button approve-button"
          onClick={() => handleLoanApproval(true)}
          disabled={isUpdatingApproval} // Disable button while updating
        >
          {isUpdatingApproval ? 'Approving...' : 'Approve Loan'}
        </button>
        <button
          className="action-button reject-button"
          onClick={() => handleLoanApproval(false)}
          disabled={isUpdatingApproval} // Disable button while updating
        >
          {isUpdatingApproval ? 'Rejecting...' : 'Reject Loan'}
        </button>
      </div>
    </div>
  );
};

export default LoanApplicationView;
