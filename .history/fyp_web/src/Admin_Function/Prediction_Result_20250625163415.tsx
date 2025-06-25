// src/Admin_Function/Prediction_Result.tsx
import React, { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import './Result.css';

// Interfaces (copied for self-containment, ensure they match your main file)
interface AIPredictionResult {
  predicted_default: boolean;
  probability: number;
  top_features: FeatureContribution[];
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

interface PredictionResultProps {
  isOpen: boolean;
  onClose: () => void;
  predictionData: AIPredictionResult | null;
  isLoadingPrediction: boolean; // Prop for loading state inside the modal
  onApprove: () => void; // Prop for approve action
  onReject: () => void;  // Prop for reject action
  isUpdatingLoanStatus: boolean; // Prop to disable buttons during loan status update
  loanApprovalStatus: boolean | null; // Pass the current loan's final_approval status
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
  // State for additional feature importances (from backend)
  const [featureImportances, setFeatureImportances] = useState<{feature: string, importance_percent: number}[]>([]);
  const [isLoadingFeatureImportances, setIsLoadingFeatureImportances] = useState(false);

  // Fetch feature importances when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingFeatureImportances(true);
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
    return null; // Don't render anything if not open
  }

  // Only use predictionData.top_features for per-prediction explanations
  // Use featureImportances for model feature importances

  return (
    <div className="prediction-modal-overlay">
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

export default PredictionResult;