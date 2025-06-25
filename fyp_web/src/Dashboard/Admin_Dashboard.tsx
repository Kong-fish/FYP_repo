// src/Admin_Function/Prediction_Result.tsx
import React, { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react'; // Import Loader2, CheckCircle, XCircle for modal buttons

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
  switch (status?.toLowerCase()) {
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
  // State for additional feature importances
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

  return (
    // Fixed overlay for the modal
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal content styled as a vertical rectangle in the center. Adjusted padding and added scrollability */}
      <div className="modal-content animate-scale-in max-w-xs w-full p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative overflow-y-auto" // Changed max-w-sm to max-w-xs (20rem/320px), adjusted padding to p-3 (12px)
           style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif', maxHeight: '90vh' }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" // Adjusted top/right for smaller padding
          title="Close"
        >
          <X size={18} /> {/* Smaller X icon */}
        </button>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">AI Loan Prediction</h3> {/* Reduced text-xl to text-lg, mb-4 to mb-3 */}

        {isLoadingPrediction ? (
          // Display loader while main prediction is loading inside the modal
          <div className="flex flex-col items-center justify-center py-6"> {/* Adjusted padding */}
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={28} /> {/* Slightly smaller loader */}
            <p className="mt-3 text-gray-700 dark:text-gray-300 text-center text-sm">Analyzing loan application...</p> {/* Adjusted margin */}
          </div>
        ) : predictionData ? (
          // Display prediction results once loaded
          <div className="flex flex-col gap-2"> {/* Reduced gap-3 to gap-2 */}
            {/* Prediction Result & Probability - Always stacked vertically for narrow modal */}
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Predicted Default:</span>
              <span className={`text-base font-bold ${predictionData.predicted_default ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                {predictionData.predicted_default ? 'High Risk (Default)' : 'Low Risk (No Default)'}
              </span>
            </div>

            <div className="flex flex-col items-center text-center mt-2"> {/* Added mt-2 to separate them visually */}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Probability of Default:</span>
              <span className="text-base font-semibold text-gray-900 dark:text-white">{(predictionData.probability * 100).toFixed(2)}%</span>
            </div>

            {/* Top Deciding Features */}
            <div className="mt-3"> {/* Adjusted mt-2 to mt-3 */}
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 text-center">Top Deciding Features:</h4>
              <ul className="list-none p-0 m-0 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                {predictionData.top_features && predictionData.top_features.length > 0 ? (
                  predictionData.top_features.map((feature, index) => (
                    <li key={index} className="flex justify-between items-center py-1 px-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 bg-gray-50 dark:bg-gray-700 even:bg-white dark:even:bg-gray-800"> {/* Adjusted padding to px-2, py-1 */}
                      <div className="flex items-center flex-grow">
                        <span className="text-xs font-bold bg-blue-600 text-white rounded-full h-4 w-4 flex items-center justify-center mr-1"> {/* Reduced mr */}
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">{feature.feature}</span> {/* Changed break-words to break-all for stronger break */}
                      </div>
                      <div className="flex items-center text-right flex-shrink-0 ml-1"> {/* Adjusted margin-left */}
                        <span className={`mr-1 text-xs ${feature.contribution > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {feature.contribution > 0 ? '▲' : '▼'}
                        </span>
                        <span className={`text-xs font-semibold ${feature.contribution > 0 ? 'text-green-700 dark:text-green-400' : (feature.contribution < 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-300')}`}>
                          {feature.contribution.toFixed(4)}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 dark:text-gray-400 text-xs italic p-2 text-center">No specific features identified.</li> {/* Adjusted padding */}
                )}
              </ul>
            </div>

            {/* Numerical Feature Importances Section */}
            <div className="mt-3"> {/* Adjusted mt-4 to mt-3 */}
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 text-center">Model Feature Importances:</h4>
              {isLoadingFeatureImportances ? (
                <div className="flex justify-center items-center py-2"> {/* Adjusted padding */}
                  <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={18} /> {/* Reduced size */}
                  <p className="ml-1.5 text-xs text-gray-700 dark:text-gray-300">Loading importances...</p> {/* Adjusted margin, text size */}
                </div>
              ) : featureImportances.length > 0 ? (
                <ul className="list-disc list-inside border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-700 text-left"> {/* Adjusted padding */}
                  {featureImportances.map(f => (
                    <li key={f.feature} className="text-sm text-gray-800 dark:text-gray-200 my-0.5 break-all"> {/* Added break-all */}
                      <span className="font-medium">{f.feature}</span>: <span className="font-semibold">{f.importance_percent.toFixed(2)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-xs italic text-center py-2">No model feature importance data available.</p> {/* Adjusted padding, text size */}
              )}
            </div>

            {/* Approve/Reject Buttons: Conditional on loanApprovalStatus and centered */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4"> {/* Reduced gap-3 to gap-2, mt-4 kept */}
              {loanApprovalStatus === null ? (
                <>
                  <button
                    onClick={onApprove}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-semibold text-sm transition-transform transform hover:scale-105"
                    disabled={isUpdatingLoanStatus}
                  >
                    {isUpdatingLoanStatus ? <Loader2 className="animate-spin mr-1.5" size={16} /> : <CheckCircle size={16} className="mr-1.5" />}
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={onReject}
                    className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-semibold text-sm transition-transform transform hover:scale-105"
                    disabled={isUpdatingLoanStatus}
                  >
                    {isUpdatingLoanStatus ? <Loader2 className="animate-spin mr-1.5" size={16} /> : <XCircle size={16} className="mr-1.5" />}
                    <span>Reject</span>
                  </button>
                </>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic">
                  Loan is already {loanApprovalStatus ? 'Approved' : 'Rejected'}.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No prediction data available.</p>
        )}
      </div>
    </div>
  );
};

export default PredictionResult;