import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Loader2, CheckCircle, XCircle } from 'lucide-react'; // Import all necessary icons
import supabase from '../supbaseClient.js';
import '../shared/normalize.css'; // Global normalize styles
import '../shared/Header.css'; // Import Header specific styles
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

const Header = () => {
    const navigate = useNavigate(); // useNavigate hook must be inside a component

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/'); 
        }
    };

    return (
        <header className="header">
            <div className="header__content">
                <div className="logo-section">
                    <span className="logo-text header__title">Eminent Western</span>
                </div>
                <div className="header-actions"> {/* This div groups DarkModeToggle and Sign Out */}
                    <DarkModeToggle />
                    <button onClick={handleSignOut} className="sign-out-button header-sign-out-btn">
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};
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
  ai_prediction: {
    predicted_default: boolean;
    probability: number;
    top_features?: { feature: string; contribution: number; }[];
  } | null;
  final_approval: boolean | null;
  loan_amount: number | null;
  account_number: string | null;
  Customer: {
    first_name: string;
    last_name: string;
    username: string;
    phone_no: string;
  } | null;
}

// Interfaces for PredictionResult (copied for self-containment)
interface AIPredictionResult {
  predicted_default: boolean;
  probability: number;
  top_features?: FeatureContribution[]; // Made optional to match the new loan application interface
}

interface FeatureContribution {
  feature: string;
  contribution: number;
}

// Helper function for status (can be externalized if used more broadly)
const getStatusClass = (status: boolean | null | string) => {
  if (typeof status === "boolean") {
    return status ? "badge-success" : "badge-error";
  }
  // Safely convert to string and then to lowercase
  switch (String(status).toLowerCase()) {
    case "active":
    case "approved":
      return "badge-success";
    case "pending":
    case "under review":
      return "badge-warning";
    case "inactive":
    case "rejected":
    case "failed":
      return "badge-error";
    default:
      return "badge-default";
  }
};

// PredictionResult Component (embedded for self-containment)
interface PredictionResultProps {
  isOpen: boolean;
  onClose: () => void;
  predictionData: AIPredictionResult | null;
  isLoadingPrediction: boolean;
  onApprove: () => void;
  onReject: () => void;
  isUpdatingLoanStatus: boolean;
  loanApprovalStatus: boolean | null;
}

const PredictionResult: React.FC<PredictionResultProps> = ({
  isOpen,
  onClose,
  predictionData,
  isLoadingPrediction,
  onApprove,
  onReject,
  isUpdatingLoanStatus,
  loanApprovalStatus
}) => {
  const [featureImportances, setFeatureImportances] = useState<{feature: string, importance_percent: number}[]>([]);
  const [isLoadingFeatureImportances, setIsLoadingFeatureImportances] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingFeatureImportances(true);
      // NOTE: This fetch call assumes a local backend server running at http://localhost:5000
      // You will need to replace this with your actual API endpoint if different.
      fetch('http://localhost:5000/api/feature_importance')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setFeatureImportances(data);
        })
        .catch(error => {
          console.error("Error fetching feature importances:", error);
          setFeatureImportances([]);
        })
        .finally(() => {
          setIsLoadingFeatureImportances(false);
        });
    } else {
      setFeatureImportances([]);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="prediction-modal-overlay">
      <style>{`
        /* PredictionResult.css styles (embedded) */

        /* Define CSS Variables for Light Mode */
        :root {
            --modal-bg-color-light: #ffffff;
            --modal-text-color: #333333;
            --modal-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            --modal-border-color: #e0e0e0;
            --modal-close-btn-color: #666;
            --modal-close-btn-hover-color: #000;
            --loader-color: #007bff;
            --section-bg-color: #f8f8f8;
            --section-border-color: #e0e0e0;
            --risk-color: #dc3545;
            --no-risk-color: #28a745;
            --probability-color: #007bff;
            --feature-list-bg: #f2f2f2;
            --feature-item-border: #e9e9e9;
            --approve-btn-bg: #10b981;
            --approve-btn-hover-bg: #059669;
            --reject-btn-bg: #ef4444;
            --reject-btn-hover-bg: #dc2626;
            --disabled-btn-bg: #cccccc;
            --disabled-btn-text: #666666;
            --status-message-color: #4a5568;
        }

        /* Dark mode variables */
        body.dark-mode {
            --modal-bg-color-light: #333333;
            --modal-text-color: #e0e0e0;
            --modal-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
            --modal-border-color: #555555;
            --modal-close-btn-color: #aaaaaa;
            --modal-close-btn-hover-color: #ffffff;
            --loader-color: #6366f1;
            --section-bg-color: #444444;
            --section-border-color: #666666;
            --risk-color: #ff6b6b; /* Brighter red for dark mode */
            --no-risk-color: #4CAF50; /* Slightly brighter green */
            --probability-color: #6366f1; /* Brighter blue */
            --feature-list-bg: #4a4a4a;
            --feature-item-border: #555555;
            --approve-btn-bg: #059669; /* Darker green for dark mode button */
            --approve-btn-hover-bg: #047857;
            --reject-btn-bg: #dc2626; /* Darker red for dark mode button */
            --reject-btn-hover-bg: #b91c1c;
            --disabled-btn-bg: #555555;
            --disabled-btn-text: #aaaaaa;
            --status-message-color: #a0aec0;
        }

        .prediction-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }

        .prediction-modal-content {
            background-color: var(--modal-bg-color-light);
            padding: 30px;
            border-radius: 12px;
            box-shadow: var(--modal-shadow);
            width: 90%;
            max-width: 600px;
            position: relative;
            animation: fadeInScale 0.3s ease-out forwards;
            border: 1px solid var(--modal-border-color);
            color: var(--modal-text-color);
        }

        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .prediction-modal-close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            color: var(--modal-close-btn-color);
            border-radius: 50%;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .prediction-modal-close-btn:hover {
            color: var(--modal-close-btn-hover-color);
            background-color: rgba(0, 0, 0, 0.05);
            transform: scale(1.1);
        }

        body.dark-mode .prediction-modal-close-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }

        .prediction-modal-title {
            font-size: 1.8rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 25px;
            color: var(--text-color-heading); /* Using a global variable for consistent headings */
            border-bottom: 1px solid var(--modal-border-color);
            padding-bottom: 15px;
        }

        .prediction-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 50px 20px;
        }

        .prediction-loader {
            animation: spin 1s linear infinite;
            color: var(--loader-color);
            margin-bottom: 15px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .prediction-loading-text {
            font-size: 1.1rem;
            color: var(--modal-text-color);
        }

        .prediction-main-content-wrapper {
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        .prediction-result-section {
            background-color: var(--section-bg-color);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid var(--section-border-color);
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        body.dark-mode .prediction-result-section {
            background-color: var(--section-bg-color);
            border-color: var(--section-border-color);
        }

        .prediction-label {
            font-weight: 600;
            margin-right: 10px;
            color: var(--text-color-heading);
            font-size: 1rem;
        }

        .prediction-value {
            font-weight: 700;
            font-size: 1.1rem;
        }

        .prediction-value.risk {
            color: var(--risk-color);
        }

        .prediction-value.no-risk {
            color: var(--no-risk-color);
        }

        .probability-value {
            color: var(--probability-color);
            font-weight: 700;
            font-size: 1.1rem;
        }

        .prediction-section-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--text-color-heading);
            border-bottom: 1px dashed var(--section-border-color);
            padding-bottom: 8px;
        }

        .feature-importances-list {
            list-style: none;
            padding: 0;
            margin: 0;
            background-color: var(--feature-list-bg);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--feature-item-border);
        }

        body.dark-mode .feature-importances-list {
            background-color: var(--feature-list-bg);
            border-color: var(--feature-item-border);
        }

        .feature-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            border-bottom: 1px solid var(--feature-item-border);
        }

        body.dark-mode .feature-item {
            border-bottom-color: var(--feature-item-border);
        }

        .feature-item:last-child {
            border-bottom: none;
        }

        .feature-name {
            font-weight: 500;
            color: var(--modal-text-color);
        }

        .feature-percentage {
            font-weight: 600;
            color: var(--probability-color); /* Using probability color for percentages */
        }

        .no-prediction-data,
        .no-feature-data {
            text-align: center;
            color: var(--modal-text-color);
            font-style: italic;
            padding: 20px 0;
        }

        /* Prediction Action Buttons */
        .prediction-actions {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid var(--section-border-color);
        }

        .prediction-action-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
        }

        .prediction-action-btn:disabled {
            background-color: var(--disabled-btn-bg);
            color: var(--disabled-btn-text);
            cursor: not-allowed;
            box-shadow: none;
        }

        .prediction-approve-btn {
            background-color: var(--approve-btn-bg);
            color: white;
        }

        .prediction-approve-btn:not(:disabled):hover {
            background-color: var(--approve-btn-hover-bg);
            transform: translateY(-2px);
        }

        .prediction-reject-btn {
            background-color: var(--reject-btn-bg);
            color: white;
        }

        .prediction-reject-btn:not(:disabled):hover {
            background-color: var(--reject-btn-hover-bg);
            transform: translateY(-2px);
        }

        .prediction-action-spinner {
            animation: spin 1s linear infinite;
        }

        .prediction-status-message {
            font-size: 1.1rem;
            font-weight: 500;
            color: var(--status-message-color);
            text-align: center;
            padding: 10px 0;
        }

        /* Responsive adjustments for modal */
        @media (max-width: 768px) {
            .prediction-modal-content {
                padding: 20px;
                width: 95%;
            }

            .prediction-modal-title {
                font-size: 1.5rem;
                margin-bottom: 20px;
            }

            .prediction-result-section {
                padding: 15px;
            }

            .prediction-label,
            .prediction-value,
            .probability-value {
                font-size: 0.95rem;
            }

            .prediction-section-title {
                font-size: 1.1rem;
            }

            .feature-item {
                padding: 8px 10px;
                font-size: 0.9rem;
            }

            .prediction-actions {
                flex-direction: column;
                gap: 15px;
            }

            .prediction-action-btn {
                width: 100%;
                padding: 10px;
                font-size: 0.95rem;
            }
        }
      `}</style>

      <div
        className="prediction-modal-content animate-scale-in"
      >
        <button
          onClick={onClose}
          className="prediction-modal-close-btn"
          title="Close"
        >
          <X size={18} />
        </button>

        <h3 className="prediction-modal-title">
          AI Loan Prediction
        </h3>

        {isLoadingPrediction ? (
          <div className="prediction-loading-container">
            <Loader2 className="prediction-loader" size={28} />
            <p className="prediction-loading-text">
              Analyzing loan application...
            </p>
          </div>
        ) : predictionData ? (
          <div className="prediction-main-content-wrapper">
            {/* Prediction Result & Probability */}
            <div className="prediction-result-section">
              <div>
                <span className="prediction-label">
                  Predicted Default:
                </span>
                <span
                  className={`prediction-value ${
                    predictionData.predicted_default
                      ? 'risk'
                      : 'no-risk'
                  }`}
                >
                  {predictionData.predicted_default
                    ? 'High Risk (Default)'
                    : 'Low Risk (No Default)'}
                </span>
              </div>
              <div>
                <span className="prediction-label">
                  Probability of Default:
                </span>
                <span className="probability-value">
                  {(predictionData.probability * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Numerical Feature Importances Section */}
            <div>
              <h4 className="prediction-section-title">
                Model Feature Importances:
              </h4>
              {isLoadingFeatureImportances ? (
                <div className="flex justify-center items-center py-2">
                  <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={18} />
                  <p className="ml-1.5 text-xs text-gray-700 dark:text-gray-300">
                    Loading importances...
                  </p>
                </div>
              ) : featureImportances.length > 0 ? (
                <ul className="feature-importances-list">
                  {featureImportances.map((f, index) => (
                    <li
                      key={f.feature || index}
                      className="feature-item"
                    >
                      <span className="feature-name">{f.feature}</span>
                      <span className="feature-percentage">{f.importance_percent.toFixed(2)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-feature-data">
                  No model feature importance data available.
                </p>
              )}
            </div>

            {/* Approve/Reject Buttons: Conditional on loanApprovalStatus and centered */}
            <div className="prediction-actions">
              {loanApprovalStatus === null ? (
                <>
                  <button
                    onClick={onApprove}
                    className="prediction-action-btn prediction-approve-btn"
                    disabled={isUpdatingLoanStatus}
                  >
                    {isUpdatingLoanStatus ? (
                      <Loader2 className="prediction-action-spinner" size={16} />
                    ) : (
                      <CheckCircle size={16} className="prediction-action-icon" />
                    )}
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={onReject}
                    className="prediction-action-btn prediction-reject-btn"
                    disabled={isUpdatingLoanStatus}
                  >
                    {isUpdatingLoanStatus ? (
                      <Loader2 className="prediction-action-spinner" size={16} />
                    ) : (
                      <XCircle size={16} className="prediction-action-icon" />
                    )}
                    <span>Reject</span>
                  </button>
                </>
              ) : (
                <p className="prediction-status-message">
                  Loan is already {loanApprovalStatus ? 'Approved' : 'Rejected'}.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="no-prediction-data">
            No prediction data available.
          </p>
        )}
      </div>
    </div>
  );
};


// Main LoanApplicationView Component
const LoanApplicationView: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();

  const [loanDetails, setLoanDetails] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingApproval, setIsUpdatingApproval] = useState<boolean>(false);
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      if (!loanId) {
        setError("Loan ID not provided in the URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const parsedLoanId = parseInt(loanId);
        if (isNaN(parsedLoanId)) {
          setError("Invalid Loan ID format.");
          setLoading(false);
          return;
        }

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
          .eq('loan_id', parsedLoanId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setLoanDetails({
            ...data,
            Customer: Array.isArray(data.Customer) ? data.Customer[0] : data.Customer,
          });
        } else {
          setError("Loan application not found for this ID.");
        }
      } catch (err: any) {
        console.error("Error fetching loan details:", err);
        setError(err.message || "Failed to load loan details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [loanId]);

  const handleBackToDashboard = () => {
    navigate('/admin-dashboard');
  };

  const handleLoanApproval = async (approvalStatus: boolean) => {
    if (!loanDetails) return;
    setIsUpdatingApproval(true);

    try {
      const { error } = await supabase
        .from('Loan')
        .update({ final_approval: approvalStatus })
        .eq('loan_id', loanDetails.loan_id);

      if (error) {
        throw error;
      }

      setLoanDetails(prevDetails => prevDetails ? { ...prevDetails, final_approval: approvalStatus } : null);
      alert(`Loan ${approvalStatus ? 'approved' : 'rejected'} successfully!`);
      setIsPredictionModalOpen(false);
    } catch (err: any) {
      console.error("Error updating loan approval status:", err);
      setError(`Failed to ${approvalStatus ? 'approve' : 'reject'} loan: ${err.message}`);
      alert(`Failed to ${approvalStatus ? 'approve' : 'reject'} loan: ${err.message}`);
    } finally {
      setIsUpdatingApproval(false);
    }
  };

  const handleViewPredictionDetails = () => {
    setIsPredictionModalOpen(true);
  };

  const handleClosePredictionModal = () => {
    setIsPredictionModalOpen(false);
  };

  if (loading) {
    return (
      <div className="loan-view-container loading">
        <p>Loading loan details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loan-view-container error-message">
        <p>Error: {error}</p>
        <button onClick={handleBackToDashboard}>Back to Dashboard</button>
      </div>
    );
  }

  if (!loanDetails) {
    return (
      <div className="loan-view-container no-data">
        <p>No loan details available for this ID.</p>
        <button onClick={handleBackToDashboard}>Back to Dashboard</button>
      </div>
    );
  }

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
        
        .view-prediction-button {
            background-color: #007bff;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.2s ease;
            margin-top: 10px; /* Adjust spacing as needed */
            align-self: flex-start; /* Align with the label */
        }

        .view-prediction-button:hover {
            background-color: #0056b3;
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

        {/* AI Prediction (if available) - Now includes a button to view details */}
        {loanDetails.ai_prediction && (
          <div className="ai-prediction-group">
            <button
              className="view-prediction-button"
              onClick={handleViewPredictionDetails}
            >
              View Prediction Details
            </button>
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

      {/* PredictionResult Modal */}
      <PredictionResult
        isOpen={isPredictionModalOpen}
        onClose={handleClosePredictionModal}
        predictionData={loanDetails.ai_prediction} // Pass the AI prediction data
        isLoadingPrediction={false} // Assuming prediction data is already loaded with loan details
        onApprove={() => handleLoanApproval(true)} // Pass the approve action
        onReject={() => handleLoanApproval(false)} // Pass the reject action
        isUpdatingLoanStatus={isUpdatingApproval} // Pass the approval update loading status
        loanApprovalStatus={loanDetails.final_approval} // Pass the current loan approval status
      />
    </div>
  );
};

export default LoanApplicationView;
