import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, XCircle, X } from 'lucide-react';
import supabase from '../supbaseClient.js';
import ""

// Interface definitions
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

interface AIPredictionResult {
    predicted_default: boolean;
    probability: number;
    top_features?: FeatureContribution[];
}

interface FeatureContribution {
    feature: string;
    contribution: number;
}

// Helper function for status classes (can be moved to a utility file if reused)
const getStatusClass = (status: boolean | null | string) => {
    if (typeof status === "boolean") {
        return status ? "status-approved" : "status-rejected";
    }
    switch (String(status).toLowerCase()) {
        case "active":
        case "approved":
            return "status-approved";
        case "pending":
        case "under review":
            return "status-pending";
        case "inactive":
        case "rejected":
        case "failed":
            return "status-rejected";
        default:
            return "status-pending";
    }
};


// PredictionResult Modal Component (defined below for self-containment)
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
    if (!isOpen) return null;

    return (
        <div className="prediction-modal-overlay">
            <div className="prediction-modal-content animate-scale-in">
                <button onClick={onClose} className="prediction-modal-close-btn" title="Close">
                    <X size={18} />
                </button>
                <h3 className="prediction-modal-title">AI Loan Prediction</h3>
                {isLoadingPrediction ? (
                    <div className="prediction-loading-container">
                        <Loader2 className="prediction-loader" size={28} />
                        <p className="prediction-loading-text">Analyzing loan application...</p>
                    </div>
                ) : predictionData ? (
                    <div className="prediction-main-content-wrapper">
                        <div className="prediction-result-section">
                            <p className="prediction-item">
                                <span className="prediction-label">Predicted Default:</span>
                                <span className={`prediction-value ${predictionData.predicted_default ? 'risk' : 'no-risk'}`}>
                                    {predictionData.predicted_default ? 'High Risk (Default)' : 'Low Risk (No Default)'}
                                </span>
                            </p>
                            <p className="prediction-item">
                                <span className="prediction-label">Probability of Default:</span>
                                <span className="probability-value">
                                    {(predictionData.probability * 100).toFixed(2)}%
                                </span>
                            </p>
                        </div>
                        <div className="prediction-feature-section">
                            <h4 className="prediction-section-subtitle">Model Feature Importances:</h4>
                            {predictionData.top_features && predictionData.top_features.length > 0 ? (
                                <ul className="feature-importances-list">
                                    {predictionData.top_features.map((f, index) => (
                                        <li key={f.feature || index} className="feature-item">
                                            <span className="feature-name">{f.feature}</span>
                                            <span className="feature-percentage">{f.contribution.toFixed(2)}%</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-feature-data">No model feature importance data available.</p>
                            )}
                        </div>
                        <div className="prediction-actions">
                            {loanApprovalStatus === null ? (
                                <>
                                    <button onClick={onApprove} className="prediction-action-btn prediction-approve-btn" disabled={isUpdatingLoanStatus}>
                                        {isUpdatingLoanStatus ? <Loader2 className="prediction-action-spinner" size={16} /> : <CheckCircle size={16} className="prediction-action-icon" />}
                                        <span>Approve</span>
                                    </button>
                                    <button onClick={onReject} className="prediction-action-btn prediction-reject-btn" disabled={isUpdatingLoanStatus}>
                                        {isUpdatingLoanStatus ? <Loader2 className="prediction-action-spinner" size={16} /> : <XCircle size={16} className="prediction-action-icon" />}
                                        <span>Reject</span>
                                    </button>
                                </>
                            ) : (
                                <p className="prediction-status-message">Loan is already {loanApprovalStatus ? 'Approved' : 'Rejected'}.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="no-prediction-data">No prediction data available.</p>
                )}
            </div>
        </div>
    );
};


// Main LoanApplicationView Component (now named ReviewLoan to match route)
const ReviewLoan: React.FC = () => {
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

                // Original Supabase data fetching logic
                const { data, error: fetchError } = await supabase
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

                if (fetchError) {
                    throw fetchError;
                }

                if (data) {
                    // Ensure Customer is not an array if it's supposed to be a single object
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
            // Original Supabase update logic
            const { error: updateError } = await supabase
                .from('Loan')
                .update({ final_approval: approvalStatus })
                .eq('loan_id', loanDetails.loan_id);

            if (updateError) {
                throw updateError;
            }

            setLoanDetails(prevDetails => prevDetails ? { ...prevDetails, final_approval: approvalStatus } : null);
            // Using a simple alert for now, consider a custom modal/toast for better UX
            alert(`Loan ${approvalStatus ? 'approved' : 'rejected'} successfully!`);
            setIsPredictionModalOpen(false); // Close modal after action
        } catch (err: any) {
            console.error("Error updating loan approval status:", err);
            alert(`Failed to ${approvalStatus ? 'approve' : 'reject'} loan: ${err.message}`); // Using alert
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

    return (
        <div className="loan-view-container">

            {loading ? (
                <div className="loan-loading-state">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p>Loading loan details...</p>
                </div>
            ) : error ? (
                <div className="loan-error-state">
                    <p>Error: {error}</p>
                    <button onClick={handleBackToDashboard} className="admin-smt-btn admin-smt-btn-primary">Back to Dashboard</button>
                </div>
            ) : !loanDetails ? (
                <div className="loan-no-data-state">
                    <p>No loan details available for this ID.</p>
                    <button onClick={handleBackToDashboard} className="admin-smt-btn admin-smt-btn-primary">Back to Dashboard</button>
                </div>
            ) : (
                <>
                    <h2 className="loan-page-title">Loan Application Details (ID: {String(loanDetails.loan_id).substring(0, 8)}...)</h2>

                    {/* Main card displaying loan details organized into sections */}
                    <div className="loan-details-card">
                        {/* Personal Details Section */}
                        <div className="loan-section-group">
                            <h3 className="loan-section-title">Personal Details</h3>
                            <div className="detail-grid">
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
                                <div className="detail-group">
                                    <p className="detail-label">Home Ownership:</p>
                                    <p className="detail-value">{loanDetails.customer_home_ownership || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Customer Defaulted:</p>
                                    <p className="detail-value">{loanDetails.customer_default !== null ? (loanDetails.customer_default ? 'Yes' : 'No') : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Loan Details Section */}
                        <div className="loan-section-group">
                            <h3 className="loan-section-title">Loan Details</h3>
                            <div className="detail-grid">
                                <div className="detail-group">
                                    <p className="detail-label">Loan Amount:</p>
                                    <p className="detail-value">${loanDetails.loan_amount?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Loan Intent:</p>
                                    <p className="detail-value">{loanDetails.loan_intent || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Application Date:</p>
                                    <p className="detail-value">{loanDetails.application_date ? new Date(loanDetails.application_date).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Final Approval:</p>
                                    <p className="detail-value">
                                        <span className={`status-badge ${getStatusClass(loanDetails.final_approval)}`}>
                                            {loanDetails.final_approval === true ? 'Approved' :
                                            loanDetails.final_approval === false ? 'Rejected' : 'Pending'}
                                        </span>
                                    </p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Loan Grade:</p>
                                    <p className="detail-value">{loanDetails.loan_grade || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Interest Rate:</p>
                                    <p className="detail-value">{loanDetails.loan_interest_rate !== null ? `${loanDetails.loan_interest_rate}%` : 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Account Number:</p>
                                    <p className="detail-value">{loanDetails.account_number || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Employment Details Section */}
                        <div className="loan-section-group">
                            <h3 className="loan-section-title">Employment Details</h3>
                            <div className="detail-grid">
                                <div className="detail-group">
                                    <p className="detail-label">Annual Income:</p>
                                    <p className="detail-value">${loanDetails.customer_annual_income?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Job Title:</p>
                                    <p className="detail-value">{loanDetails.customer_job_title || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Company:</p>
                                    <p className="detail-value">{loanDetails.customer_job_company_name || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Years at Job:</p>
                                    <p className="detail-value">{loanDetails.customer_job_years !== null ? loanDetails.customer_job_years : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Credit Information Section */}
                        <div className="loan-section-group">
                            <h3 className="loan-section-title">Credit Information</h3>
                            <div className="detail-grid">
                                <div className="detail-group">
                                    <p className="detail-label">Credit Score:</p>
                                    <p className="detail-value">{loanDetails.customer_credit_score || 'N/A'}</p>
                                </div>
                                <div className="detail-group">
                                    <p className="detail-label">Credit History (Years):</p>
                                    <p className="detail-value">{loanDetails.customer_credit_history_years !== null ? loanDetails.customer_credit_history_years : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Prediction (if available) - Now includes a button to view details */}
                        {loanDetails.ai_prediction && (
                            <div className="ai-prediction-group">
                                <button
                                    className="view-prediction-button"
                                    onClick={handleViewPredictionDetails}
                                    disabled={isPredictionModalOpen}
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
                            disabled={isUpdatingApproval || loanDetails.final_approval !== null}
                        >
                            {isUpdatingApproval ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Approving...</span>
                                </>
                            ) : (
                                <span>Approve Loan</span>
                            )}
                        </button>
                        <button
                            className="action-button reject-button"
                            onClick={() => handleLoanApproval(false)}
                            disabled={isUpdatingApproval || loanDetails.final_approval !== null}
                        >
                            {isUpdatingApproval ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Rejecting...</span>
                                </>
                            ) : (
                                <span>Reject Loan</span>
                            )}
                        </button>
                    </div>

                    {/* PredictionResult Modal */}
                    <PredictionResult
                        isOpen={isPredictionModalOpen}
                        onClose={handleClosePredictionModal}
                        predictionData={loanDetails.ai_prediction}
                        isLoadingPrediction={false}
                        onApprove={() => handleLoanApproval(true)}
                        onReject={() => handleLoanApproval(false)}
                        isUpdatingLoanStatus={isUpdatingApproval}
                        loanApprovalStatus={loanDetails.final_approval}
                    />
                </>
            )}
        </div>
    );
};

export default ReviewLoan;
