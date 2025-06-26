import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import supabase from '../supbaseClient.js';
// Removed normalize.css and Header.css imports here as they might be handled by global or AdminFunction.css
import '../shared/Header.css';
import './LoanApplicationView.css'; // Import the new CSS file
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/');
        }
    };

    // Function to navigate back to the admin dashboard
    const handleBack = () => {
        navigate("/admin-dashboard");
    };

    return (
        <header className="header">
            <div className="header__content">
                {/* Back Button with text */}
                <button onClick={handleBack} className="back-button">
                    <ArrowLeft size={24} />
                    <span className="back-button-text">Back</span>
                </button>

                <div className="logo-section">
                    <h1 className="logo-text">Eminent Western</h1>
                </div>
                <nav className="header-nav"></nav>
                <div className="header-actions">
                    <DarkModeToggle />
                    <button onClick={handleSignOut} className="admin-smt-sign-out-button header-sign-out-btn">
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

interface AIPredictionResult {
    predicted_default: boolean;
    probability: number;
    top_features?: FeatureContribution[];
}

interface FeatureContribution {
    feature: string;
    contribution: number;
}

const getStatusClass = (status: boolean | null | string) => {
    if (typeof status === "boolean") {
        return status ? "approved" : "rejected"; // Returns 'approved' or 'rejected'
    }
    switch (String(status).toLowerCase()) {
        case "active":
        case "approved":
            return "approved";
        case "pending":
        case "under review":
            return "pending";
        case "inactive":
        case "rejected":
        case "failed":
            return "rejected";
        default:
            return "pending"; // Fallback to pending or a new 'default' if needed
    }
};

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
            {/* The style tag was moved to LoanApplicationView.css */}
            <div className="prediction-modal-content animate-scale-in">
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
            // Replace alert with a custom message box if possible in a real app
            alert(`Loan ${approvalStatus ? 'approved' : 'rejected'} successfully!`); 
            setIsPredictionModalOpen(false);
        } catch (err: any) {
            console.error("Error updating loan approval status:", err);
            setError(`Failed to ${approvalStatus ? 'approve' : 'reject'} loan: ${err.message}`);
            // Replace alert with a custom message box if possible in a real app
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
            {/* The style tag was moved to LoanApplicationView.css */}
            <Header />

            {/* Page title with truncated Loan ID */}
            <h2 className="page-title">Loan Application Details (ID: {String(loanDetails.loan_id).substring(0, 8)}...)</h2>

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
                            <p className="detail-value">{loanDetails.customer_home_ownership}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Customer Defaulted:</p>
                            <p className="detail-value">{loanDetails.customer_default ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>

                {/* Loan Details Section */}
                <div className="loan-section-group">
                    <h3 className="loan-section-title">Loan Details</h3>
                    <div className="detail-grid">
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
                        <div className="detail-group">
                            <p className="detail-label">Loan Grade:</p>
                            <p className="detail-value">{loanDetails.loan_grade}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Interest Rate:</p>
                            <p className="detail-value">{loanDetails.loan_interest_rate}%</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Account Number:</p>
                            <p className="detail-value">{loanDetails.account_number}</p>
                        </div>
                    </div>
                </div>

                {/* Employment Details Section */}
                <div className="loan-section-group">
                    <h3 className="loan-section-title">Employment Details</h3>
                    <div className="detail-grid">
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
                    </div>
                </div>

                {/* Credit Information Section */}
                <div className="loan-section-group">
                    <h3 className="loan-section-title">Credit Information</h3>
                    <div className="detail-grid">
                        <div className="detail-group">
                            <p className="detail-label">Credit Score:</p>
                            <p className="detail-value">{loanDetails.customer_credit_score}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Credit History (Years):</p>
                            <p className="detail-value">{loanDetails.customer_credit_history_years}</p>
                        </div>
                    </div>
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
                    disabled={isUpdatingApproval || loanDetails.final_approval !== null} /* Disable if already approved/rejected */
                >
                    {isUpdatingApproval ? 'Approving...' : 'Approve Loan'}
                </button>
                <button
                    className="action-button reject-button"
                    onClick={() => handleLoanApproval(false)}
                    disabled={isUpdatingApproval || loanDetails.final_approval !== null} /* Disable if already approved/rejected */
                >
                    {isUpdatingApproval ? 'Rejecting...' : 'Reject Loan'}
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
        </div>
    );
};

export default LoanApplicationView;