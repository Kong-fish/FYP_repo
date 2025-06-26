import React, { useState } from 'react';
import './CustFunction.css';
import supabase from '../supabaseClient.js'; // Make sure this path is correct for your project

interface FormData {
  customer_annual_income: string;
  customer_home_ownership: string;
  customer_job_company_name: string;
  customer_job_title: string;
  customer_job_years: string;
  loan_intent: string;
  loan_amount: string;
  account_number: string;
  customer_credit_score: string;
  customer_credit_history_years: string;
}

interface Errors {
  customer_annual_income?: string;
  customer_home_ownership?: string;
  customer_job_company_name?: string;
  customer_job_title?: string;
  customer_job_years?: string;
  loan_intent?: string;
  loan_amount?: string;
  account_number?: string;
  customer_credit_score?: string;
  customer_credit_history_years?: string;
}

export default function Cust_Apply_Loan() {
  const [formData, setFormData] = useState<FormData>({
    customer_annual_income: '',
    customer_home_ownership: '',
    customer_job_company_name: '',
    customer_job_title: '',
    customer_job_years: '',
    loan_intent: '',
    loan_amount: '',
    account_number: '',
    customer_credit_score: '',
    customer_credit_history_years: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): Errors => {
    let newErrors: Errors = {};
    if (!formData.customer_annual_income) newErrors.customer_annual_income = "Annual Income is required.";
    else if (parseFloat(formData.customer_annual_income) <= 0) newErrors.customer_annual_income = "Annual Income must be a positive number.";

    if (!formData.customer_home_ownership) newErrors.customer_home_ownership = "Home Ownership is required.";

    if (!formData.customer_job_company_name) newErrors.customer_job_company_name = "Company Name is required.";
    if (!formData.customer_job_title) newErrors.customer_job_title = "Job Title is required.";
    if (!formData.customer_job_years) newErrors.customer_job_years = "Years of Employment is required.";
    else if (parseInt(formData.customer_job_years) < 0) newErrors.customer_job_years = "Years of Employment cannot be negative.";

    if (!formData.loan_intent) newErrors.loan_intent = "Loan Purpose is required.";
    if (!formData.loan_amount) newErrors.loan_amount = "Loan Amount is required.";
    else if (parseFloat(formData.loan_amount) < 1000 || parseFloat(formData.loan_amount) > 100000) newErrors.loan_amount = "Loan Amount must be between $1,000 and $100,000.";

    if (!formData.account_number) newErrors.account_number = "Account Number is required.";
    // Basic account number validation (e.g., must be digits)
    else if (!/^\d+$/.test(formData.account_number)) newErrors.account_number = "Account Number must contain only digits.";


    if (!formData.customer_credit_score) newErrors.customer_credit_score = "Credit Score is required.";
    else if (parseInt(formData.customer_credit_score) < 300 || parseInt(formData.customer_credit_score) > 850) newErrors.customer_credit_score = "Credit Score must be between 300 and 850.";

    if (!formData.customer_credit_history_years) newErrors.customer_credit_history_years = "Credit History Length is required.";
    else if (parseInt(formData.customer_credit_history_years) < 0) newErrors.customer_credit_history_years = "Credit History Length cannot be negative.";

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error for the field as user types
    if (errors[name as keyof Errors]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});
    setIsSuccess(false);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError("Please correct the errors in the form.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get the current logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setSubmitError("You must be logged in to apply for a loan. Please ensure you are authenticated.");
        setIsSubmitting(false);
        return;
      }

      // 2. Prepare data for Supabase insertion, converting types as needed
      const dataToInsert = {
        customer_id: user.id, // Link to the authenticated user
        customer_annual_income: parseFloat(formData.customer_annual_income),
        customer_home_ownership: formData.customer_home_ownership,
        customer_job_company_name: formData.customer_job_company_name,
        customer_job_title: formData.customer_job_title,
        customer_job_years: parseInt(formData.customer_job_years),
        loan_intent: formData.loan_intent,
        loan_amount: parseFloat(formData.loan_amount),
        account_number: formData.account_number,
        customer_credit_score: parseInt(formData.customer_credit_score),
        customer_credit_history_years: parseInt(formData.customer_credit_history_years),
        // application_date and loan_id are handled by Supabase defaults
        // ai_prediction, final_approval, loan_grade, customer_default, loan_interest_rate
        // these can be set with defaults in Supabase or added here if you have logic for them
      };

      // 3. Insert data into the 'Loan' table
      const { data, error } = await supabase
        .from('Loan')
        .insert([dataToInsert]); // Insert the single object within an array

      if (error) {
        console.error("Supabase submission error:", error);
        // Provide a more user-friendly error message
        if (error.code === '23503' && error.details?.includes('account_number')) {
            setSubmitError("Invalid Account Number. Please ensure it exists and is correct.");
        } else if (error.message.includes("violates row-level security policy")) {
            setSubmitError("You don't have permission to submit a loan application. Please check your account status or contact support.");
        }
        else {
            setSubmitError(`Failed to submit application: ${error.message}`);
        }
      } else {
        setIsSuccess(true);
        // Clear form data on successful submission
        setFormData({
          customer_annual_income: '',
          customer_home_ownership: '',
          customer_job_company_name: '',
          customer_job_title: '',
          customer_job_years: '',
          loan_intent: '',
          loan_amount: '',
          account_number: '',
          customer_credit_score: '',
          customer_credit_history_years: '',
        });
      }
    } catch (error) {
      console.error("Unexpected submission error:", error);
      setSubmitError("An unexpected error occurred during submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewApplication = () => {
    setIsSuccess(false);
    setSubmitError(null);
    setErrors({});
  };

  return (
    <div className="loan-application-page">
      {/* Header */}
      <header className="loan-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">🏦</div>
              <span className="logo-text">Eminent Western</span>
            </div>
            <div className="header-title">
              <h1>Loan Application</h1>
              <p>Apply for a personal loan with competitive rates</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container">
        <div className="application-layout">
          {/* Progress Card (Static for this example, adjust if dynamic steps are needed) */}
          <div className="progress-section">
            <div className="progress-card">
              <h3>Application Progress</h3>
              <div className="steps-container">
                <div className="step active">
                  <div className="step-number">1</div>
                  <span className="step-label">Application Form</span>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <span className="step-label">Review</span>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <span className="step-label">Confirmation</span>
                </div>
              </div>
            </div>

            {/* Calculator Card (Static for this example) */}
            <div className="calculator-card">
              <h3>Loan Calculator</h3>
              <div className="calc-row">
                <span>Interest Rate:</span>
                <span>5.5%</span>
              </div>
              <div className="calc-row">
                <span>Max Loan Term:</span>
                <span>60 Months</span>
              </div>
              <div className="calc-row total">
                <span>Est. Monthly Payment:</span>
                <span>$478.18</span>
              </div>
              <p className="field-hint">Estimates based on a $25,000 loan over 60 months.</p>
            </div>
          </div>

          {/* Application Form or Success Message */}
          <div className="form-section">
            {isSuccess ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h2>Application Submitted Successfully!</h2>
                <p>Thank you for your loan application. We have received your submission and will review it shortly.</p>
                <p>You will receive an email notification regarding the status of your application within 1-2 business days.</p>
                <button onClick={handleNewApplication} className="btn-primary">
                  Apply for another loan
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="loan-form">
                {submitError && <div className="submit-error-message">{submitError}</div>} {/* Display submission error */}
                {/* Personal Information Section */}
                <div className="form-section-card">
                  <h2 className="section-title">Personal Information</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="customer_annual_income">Annual Income *</label>
                      <div className="input-wrapper">
                        <span className="input-prefix">$</span>
                        <input
                          type="number"
                          id="customer_annual_income"
                          name="customer_annual_income"
                          value={formData.customer_annual_income}
                          onChange={handleInputChange}
                          placeholder="75000"
                          className={errors.customer_annual_income ? "error" : ""}
                        />
                      </div>
                      {errors.customer_annual_income && (
                        <span className="error-message">{errors.customer_annual_income}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer_home_ownership">Home Ownership *</label>
                      <input
                        type="text"
                        id="customer_home_ownership"
                        name="customer_home_ownership"
                        value={formData.customer_home_ownership}
                        onChange={handleInputChange}
                        placeholder="Own, Mortgage, Rent, Other"
                        className={errors.customer_home_ownership ? "error" : ""}
                      />
                      {errors.customer_home_ownership && (
                        <span className="error-message">{errors.customer_home_ownership}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Employment Information Section */}
                <div className="form-section-card">
                  <h2 className="section-title">Employment Information</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="customer_job_company_name">Company Name *</label>
                      <input
                        type="text"
                        id="customer_job_company_name"
                        name="customer_job_company_name"
                        value={formData.customer_job_company_name}
                        onChange={handleInputChange}
                        placeholder="ABC Corporation"
                        className={errors.customer_job_company_name ? "error" : ""}
                      />
                      {errors.customer_job_company_name && (
                        <span className="error-message">{errors.customer_job_company_name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer_job_title">Job Title *</label>
                      <input
                        type="text"
                        id="customer_job_title"
                        name="customer_job_title"
                        value={formData.customer_job_title}
                        onChange={handleInputChange}
                        placeholder="Software Engineer"
                        className={errors.customer_job_title ? "error" : ""}
                      />
                      {errors.customer_job_title && <span className="error-message">{errors.customer_job_title}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="customer_job_years">Years of Employment *</label>
                      <input
                        type="number"
                        id="customer_job_years"
                        name="customer_job_years"
                        value={formData.customer_job_years}
                        onChange={handleInputChange}
                        placeholder="5"
                        min="0"
                        className={errors.customer_job_years ? "error" : ""}
                      />
                      {errors.customer_job_years && <span className="error-message">{errors.customer_job_years}</span>}
                    </div>
                  </div>
                </div>

                {/* Loan Information Section */}
                <div className="form-section-card">
                  <h2 className="section-title">Loan Information</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="loan_intent">Loan Purpose *</label>
                      <input
                        type="text"
                        id="loan_intent"
                        name="loan_intent"
                        value={formData.loan_intent}
                        onChange={handleInputChange}
                        placeholder="Personal, Education, Medical, etc."
                        className={errors.loan_intent ? "error" : ""}
                      />
                      {errors.loan_intent && <span className="error-message">{errors.loan_intent}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="loan_amount">Loan Amount *</label>
                      <div className="input-wrapper">
                        <span className="input-prefix">$</span>
                        <input
                          type="number"
                          id="loan_amount"
                          name="loan_amount"
                          value={formData.loan_amount}
                          onChange={handleInputChange}
                          placeholder="25000"
                          min="1000"
                          max="100000"
                          className={errors.loan_amount ? "error" : ""}
                        />
                      </div>
                      {errors.loan_amount && <span className="error-message">{errors.loan_amount}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="account_number">Account Number *</label>
                      <input
                        type="text"
                        id="account_number"
                        name="account_number"
                        value={formData.account_number}
                        onChange={handleInputChange}
                        placeholder="e.g., 1234567890 (Your Bank Account)"
                        className={errors.account_number ? "error" : ""}
                      />
                      {errors.account_number && <span className="error-message">{errors.account_number}</span>}
                    </div>
                  </div>
                </div>

                {/* Credit Information Section */}
                <div className="form-section-card">
                  <h2 className="section-title">Credit Information</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="customer_credit_score">Credit Score *</label>
                      <input
                        type="number"
                        id="customer_credit_score"
                        name="customer_credit_score"
                        value={formData.customer_credit_score}
                        onChange={handleInputChange}
                        placeholder="750"
                        min="300"
                        max="850"
                        className={errors.customer_credit_score ? "error" : ""}
                      />
                      <small className="field-hint">Score range: 300-850</small>
                      {errors.customer_credit_score && (
                        <span className="error-message">{errors.customer_credit_score}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="customer_credit_history_years">Credit History Length *</label>
                      <input
                        type="number"
                        id="customer_credit_history_years"
                        name="customer_credit_history_years"
                        value={formData.customer_credit_history_years}
                        onChange={handleInputChange}
                        placeholder="5"
                        min="0"
                        className={errors.customer_credit_history_years ? "error" : ""}
                      />
                      {errors.customer_credit_history_years && (
                        <span className="error-message">{errors.customer_credit_history_years}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="submit-section">
                  <div className="terms-notice">
                    <p>
                      By submitting this application, you agree to our{" "}
                      <a href="#" className="link">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="link">
                        Privacy Policy
                      </a>
                      . We may perform a credit check as part of the application process.
                    </p>
                  </div>

                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="loading-spinner"></span>
                        Processing Application...
                      </>
                    ) : (
                      "Submit Loan Application"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}