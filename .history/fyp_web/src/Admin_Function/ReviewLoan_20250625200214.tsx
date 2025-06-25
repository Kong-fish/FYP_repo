import React, { useState, useEffect } from 'react';
import supabase from '../supbaseClient.js';
import { Eye, X } from 'lucide-react'; // For view icon and close icon
import './LoanApplicationView.css'; // We'll create this CSS file

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
  ai_prediction: any | null; // JSON type
  final_approval: boolean | null;
  loan_amount: number | null;
  account_number: string | null;
  // Fields from joined Customer table
  Customer: {
    first_name: string;
    last_name: string;
    username: string; // Assuming this is email
    phone_no: string;
  } | null;
}

const LoanApplicationView: React.FC = () => {
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

  useEffect(() => {
    const fetchLoanApplications = async () => {
      try {
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
          .order('application_date', { ascending: false });

        if (error) {
          throw error;
        }
        // Fix: Map Customer array to single object
        setLoanApplications(
          (data as any[]).map((loan) => ({
            ...loan,
            Customer: Array.isArray(loan.Customer) ? loan.Customer[0] : loan.Customer,
          }))
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanApplications();
  }, []);

  const handleViewDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
  };

  const handleCloseDetails = () => {
    setSelectedLoan(null);
  };

  if (loading) {
    return <div className="loan-view-container">Loading loan applications...</div>;
  }

  if (error) {
    return <div className="loan-view-container error-message">Error: {error}</div>;
  }

  return (
    <div className="loan-view-container">
      <h2>Loan Applications</h2>
      {loanApplications.length === 0 ? (
        <p>No loan applications found.</p>
      ) : (
        <div className="loan-table-wrapper">
          <table className="loan-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Intent</th>
                <th>Application Date</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loanApplications.map((loan) => (
                <tr key={loan.loan_id}>
                  <td>{loan.loan_id}</td>
                  <td>{loan.Customer?.first_name} {loan.Customer?.last_name}</td>
                  <td>${loan.loan_amount?.toLocaleString()}</td>
                  <td>{loan.loan_intent}</td>
                  <td>{new Date(loan.application_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${
                      loan.final_approval === true ? 'approved' :
                      loan.final_approval === false ? 'rejected' : 'pending'
                    }`}>
                      {loan.final_approval === true ? 'Approved' :
                       loan.final_approval === false ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleViewDetails(loan)} className="action-button view-button">
                      <Eye size={18} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedLoan && (
        <div className="loan-details-modal-overlay" onClick={handleCloseDetails}>
          <div className="loan-details-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseDetails}>
              <X size={24} />
            </button>
            <h3>Loan Application Details (ID: {selectedLoan.loan_id})</h3>
            <div className="detail-grid">
              <p><strong>Customer Name:</strong> {selectedLoan.Customer?.first_name} {selectedLoan.Customer?.last_name}</p>
              <p><strong>Customer Email:</strong> {selectedLoan.Customer?.username}</p>
              <p><strong>Customer Phone:</strong> {selectedLoan.Customer?.phone_no}</p>
              <p><strong>Loan Amount:</strong> ${selectedLoan.loan_amount?.toLocaleString()}</p>
              <p><strong>Loan Intent:</strong> {selectedLoan.loan_intent}</p>
              <p><strong>Application Date:</strong> {new Date(selectedLoan.application_date).toLocaleString()}</p>
              <p><strong>Final Approval:</strong>
                <span className={`status-badge ${
                  selectedLoan.final_approval === true ? 'approved' :
                  selectedLoan.final_approval === false ? 'rejected' : 'pending'
                }`}>
                  {selectedLoan.final_approval === true ? 'Approved' :
                   selectedLoan.final_approval === false ? 'Rejected' : 'Pending'}
                </span>
              </p>
              <p><strong>Annual Income:</strong> ${selectedLoan.customer_annual_income?.toLocaleString()}</p>
              <p><strong>Job Title:</strong> {selectedLoan.customer_job_title}</p>
              <p><strong>Company:</strong> {selectedLoan.customer_job_company_name}</p>
              <p><strong>Years at Job:</strong> {selectedLoan.customer_job_years}</p>
              <p><strong>Home Ownership:</strong> {selectedLoan.customer_home_ownership}</p>
              <p><strong>Loan Grade:</strong> {selectedLoan.loan_grade}</p>
              <p><strong>Interest Rate:</strong> {selectedLoan.loan_interest_rate}%</p>
              <p><strong>Credit Score:</strong> {selectedLoan.customer_credit_score}</p>
              <p><strong>Credit History (Years):</strong> {selectedLoan.customer_credit_history_years}</p>
              <p><strong>Customer Defaulted:</strong> {selectedLoan.customer_default ? 'Yes' : 'No'}</p>
              <p><strong>Account Number:</strong> {selectedLoan.account_number}</p>
              {selectedLoan.ai_prediction && (
                <div className="ai-prediction">
                  <strong>AI Prediction:</strong>
                  <pre>{JSON.stringify(selectedLoan.ai_prediction, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanApplicationView;