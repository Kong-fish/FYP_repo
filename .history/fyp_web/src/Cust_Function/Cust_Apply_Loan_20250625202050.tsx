import React, { useState } from "react";
import supabase from '../supabaseClient'; // Assuming supabaseClient is correctly configured
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating a customer_id (install if not present: npm install uuid @types/uuid)

// Define an interface for your form data structure, matching the database types
interface LoanFormData {
  customer_annual_income: string; // Still string for form input
  customer_job_company_name: string;
  customer_job_title: string;
  customer_job_years: string; // Still string for form input
  customer_home_ownership: string;
  loan_intent: string;
  loan_amount: string; // Still string for form input
  account_number: string;
  customer_credit_score: string; // Still string for form input
  customer_credit_history_years: string; // Still string for form input
}

export default function CustomerLoanApply() {
  const [formData, setFormData] = useState<LoanFormData>({
    // Personal Information
    customer_annual_income: "",
    customer_job_company_name: "",
    customer_job_title: "",
    customer_job_years: "",
    customer_home_ownership: "",

    // Loan Information
    loan_intent: "",
    loan_amount: "",
    account_number: "",

    // Credit Information
    customer_credit_score: "",
    customer_credit_history_years: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.customer_annual_income) newErrors.customer_annual_income = "Annual income is required";
    if (!formData.customer_job_company_name) newErrors.customer_job_company_name = "Company name is required";
    if (!formData.customer_job_title) newErrors.customer_job_title = "Job title is required";
    if (!formData.customer_job_years) newErrors.customer_job_years = "Years of employment is required";
    if (!formData.customer_home_ownership) newErrors.customer_home_ownership = "Home ownership status is required";
    if (!formData.loan_intent) newErrors.loan_intent = "Loan purpose is required";
    if (!formData.loan_amount) newErrors.loan_amount = "Loan amount is required";
    if (!formData.account_number) newErrors.account_number = "Account number is required";
    if (!formData.customer_credit_score) newErrors.customer_credit_score = "Credit score is required";
    if (!formData.customer_credit_history_years)
      newErrors.customer_credit_history_years = "Credit history length is required";

    // Numeric validation and range checks
    const annualIncome = parseFloat(formData.customer_annual_income);
    if (formData.customer_annual_income && (isNaN(annualIncome) || annualIncome <= 0)) {
      newErrors.customer_annual_income = "Please enter a valid positive income amount";
    }

    const loanAmount = parseFloat(formData.loan_amount);
    if (formData.loan_amount && (isNaN(loanAmount) || loanAmount < 1000 || loanAmount > 100000)) {
      newErrors.loan_amount = "Loan amount must be between 1,000 and 100,000";
    }

    const creditScore = parseInt(formData.customer_credit_score);
    if (formData.customer_credit_score && (isNaN(creditScore) || creditScore < 300 || creditScore > 850)) {
      newErrors.customer_credit_score = "Credit score must be between 300 and 850";
    }

    const jobYears = parseInt(formData.customer_job_years);
    if (formData.customer_job_years && (isNaN(jobYears) || jobYears < 0)) {
      newErrors.customer_job_years = "Please enter a valid number of years (0 or more)";
    }

    const creditHistoryYears = parseInt(formData.customer_credit_history_years);
    if (formData.customer_credit_history_years && (isNaN(creditHistoryYears) || creditHistoryYears < 0)) {
      newErrors.customer_credit_history_years = "Please enter a valid number of years (0 or more)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null); // Clear previous submission errors

    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setIsSubmitting(true); // Set submitting state to true

    try {
      // --- IMPORTANT: Handle customer_id (UUID) ---
      // In a real application:
      // 1. If the user is logged in, use their existing customer_id from auth session.
      // 2. If it's a new customer, you'd first insert into the "Customer" table
      //    to get a new customer_id, then use that here.
      // For this example, we'll generate a placeholder UUID.
      const customerId = uuidv4(); // Generates a random UUID

      // Step 1: Validate account_number against the "Account" table
      // This ensures the account number provided by the customer exists in your database.
      // For a robust system, you'd also verify if this account_number belongs to the customer_id.
      const { data: accountData, error: accountError } = await supabase
        .from('Account') // Assuming your account table is named 'Account'
        .select('account_no')
        .eq('account_no', formData.account_number)
        .single();

      if (accountError || !accountData) {
        throw new Error("Invalid account number or account not found. Please ensure it's a valid account.");
      }

      // Step 2: Insert data into the "Loan" table
      // The column names here must exactly match your Supabase 'Loan' table schema.
      const { data, error } = await supabase.from("Loan").insert([
        {
          customer_id: customerId, // Using a generated UUID for demonstration. Adapt as needed.
          customer_annual_income: parseFloat(formData.customer_annual_income),
          customer_job_company_name: formData.customer_job_company_name,
          customer_job_title: formData.customer_job_title,
          customer_job_years: parseInt(formData.customer_job_years),
          customer_home_ownership: formData.customer_home_ownership,
          loan_intent: formData.loan_intent,
          loan_amount: parseFloat(formData.loan_amount),
          account_number: formData.account_number, // The validated account number
          customer_credit_score: parseInt(formData.customer_credit_score),
          customer_credit_history_years: parseInt(formData.customer_credit_history_years),
          // Columns like 'loan_grade', 'loan_interest_rate', 'ai_prediction', 'final_approval', 'application_date'
          // are typically handled by:
          // - Supabase defaults (e.g., application_date set to NOW()).
          // - Your AI/backend logic (e.g., ai_prediction, loan_grade, loan_interest_rate updated after model inference).
          // - Admin actions (e.g., final_approval).
          // Do NOT include them here unless your Supabase schema requires them and you have client-side values.
        },
      ]);

      if (error) {
        throw error; // Propagate the error for catch block
      }

      console.log("Loan Application Data saved to Supabase:", data);
      setSubmitSuccess(true); // Indicate successful submission

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          customer_annual_income: "",
          customer_job_company_name: "",
          customer_job_title: "",
          customer_job_years: "",
          customer_home_ownership: "",
          loan_intent: "",
          loan_amount: "",
          account_number: "",
          customer_credit_score: "",
          customer_credit_history_years: "",
        });
        setSubmitSuccess(false); // Hide success message after a delay
      }, 3000);
    } catch (error: any) {
      // Catch and display submission errors
      console.error("Error submitting loan application to Supabase:", error.message);
      setSubmitError(`Failed to submit application: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false); // Always reset submitting state
    }
  };

  // Render the success message if submitSuccess is true
  if (submitSuccess) {
    return (
      <div className="loan-application-container">
        <div className="container">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Application Submitted Successfully!</h2>
            <p>Your loan application has been received and is being processed.</p>
            <p>Our team will review your application and you will receive an update shortly.</p>
            <button className="btn-primary" onClick={() => setSubmitSuccess(false)}>
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the form otherwise
  return (
    <div className="loan-application-container">
      {/* Embedding the provided CSS directly here */}
      <style>
        {`
          /* Root Variables */
          :root {
            --primary: #385a93;
            --primary-dark: #2b4a7d;
            --secondary: #f6ad55;
            --secondary-dark: #ed8936;
            --success: #38a169;
            --error: #e53e3e;
            --warning: #d69e2e;
            --background: #fcf9f8;
            --background-dark: #1a202c;
            --text: #333;
            --text-dark: #fff;
            --text-muted: #718096;
            --card-bg: #ffffff;
            --card-bg-dark: #2d3748;
            --border: #e2e8f0;
            --border-dark: #4a5568;
            --input-bg: #ffffff;
            --input-border: #d1d5db;
            --input-focus: #385a93;
          }

          /* Base Styles */
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: 'Inter', sans-serif; /* Changed to Inter for consistency */
            line-height: 1.5;
            color: var(--text);
            background-color: var(--background);
          }

          .container {
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
            padding: 0 1rem;
          }

          /* Loan Application Container */
          .loan-application-container {
            min-height: 100vh;
            background-color: var(--background);
            padding-top: 80px; /* Adjusted padding-top to account for header */
          }

          /* Header */
          .loan-header {
            background-color: var(--primary);
            color: white;
            padding: 1rem 0; /* Adjusted padding */
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .logo-section {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .logo-icon {
            font-size: 2rem;
          }

          .logo-text {
            font-size: 1.5rem;
            font-weight: bold;
          }

          .header-title h1 {
            margin: 0;
            font-size: 1.8rem; /* Adjusted font size */
            font-weight: 700;
          }

          .header-title p {
            margin: 0.25rem 0 0 0; /* Adjusted margin */
            opacity: 0.9;
            font-size: 0.9rem; /* Adjusted font size */
          }

          /* Application Layout */
          .application-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2rem 0;
          }

          @media (min-width: 1024px) {
            .application-layout {
              grid-template-columns: 1fr; /* Removed sidebar, so it's just one column */
            }
          }

          /* Form Section */
          .form-section {
            display: flex;
            flex-direction: column;
          }

          .loan-form {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .form-section-card {
            background-color: var(--card-bg);
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border);
          }

          .section-title {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text);
            border-bottom: 2px solid var(--primary);
            padding-bottom: 0.5rem;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          @media (min-width: 768px) {
            .form-row {
              grid-template-columns: 1fr 1fr;
            }
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            font-weight: 500;
            color: var(--text);
            font-size: 0.875rem;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-prefix {
            position: absolute;
            left: 0.75rem;
            color: var(--text-muted);
            font-weight: 500;
            z-index: 1;
          }

          .form-group input,
          .form-group select { /* Kept select in CSS for general styling, but not in HTML */
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--input-border);
            border-radius: 0.375rem;
            background-color: var(--input-bg);
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .input-wrapper input {
            padding-left: 2rem;
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: var(--input-focus);
            box-shadow: 0 0 0 3px rgba(56, 90, 147, 0.1);
          }

          .form-group input.error,
          .form-group select.error {
            border-color: var(--error);
            box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
          }

          .field-hint {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
          }

          .error-message {
            color: var(--error);
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }

          .submit-error-message {
            color: var(--error);
            background-color: #fee2e2;
            padding: 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          /* Submit Section */
          .submit-section {
            background-color: var(--card-bg);
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border);
            text-align: center;
          }

          .terms-notice {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background-color: #f7fafc;
            border-radius: 0.375rem;
            border-left: 4px solid var(--primary);
          }

          .terms-notice p {
            margin: 0;
            font-size: 0.875rem;
            color: var(--text-muted);
            line-height: 1.5;
          }

          .link {
            color: var(--primary);
            text-decoration: none;
          }

          .link:hover {
            text-decoration: underline;
          }

          .btn-submit {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.375rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin: 0 auto;
            min-width: 200px;
          }

          .btn-submit:hover:not(:disabled) {
            background-color: var(--primary-dark);
          }

          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading-spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* Success Message */
          .success-message {
            text-align: center;
            padding: 3rem 2rem;
            background-color: var(--card-bg);
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border);
            margin: 2rem auto; /* Centered */
            max-width: 600px; /* Max width for success message */
          }

          .success-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .success-message h2 {
            color: var(--success);
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
          }

          .success-message p {
            color: var(--text-muted);
            margin: 0.5rem 0;
            line-height: 1.6;
          }

          .btn-primary {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 1.5rem;
          }

          .btn-primary:hover {
            background-color: var(--primary-dark);
          }

          /* Dark Mode Support */
          html.dark {
            --background: var(--background-dark);
            --text: var(--text-dark);
            --card-bg: var(--card-bg-dark);
            --border: var(--border-dark);
            --input-bg: var(--card-bg-dark);
            --input-border: var(--border-dark);
          }

          html.dark .loan-header {
            background-color: var(--primary-dark);
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          }

          html.dark .header-title h1,
          html.dark .header-title p,
          html.dark .logo-text,
          html.dark .logo-icon {
            color: var(--text-dark);
          }

          html.dark .progress-card,
          html.dark .calculator-card,
          html.dark .form-section-card,
          html.dark .submit-section,
          html.dark .success-message {
            background-color: var(--card-bg-dark);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
            border-color: var(--border-dark);
          }

          html.dark .progress-card h3,
          html.dark .calculator-card h3,
          html.dark .section-title,
          html.dark .form-group label,
          html.dark .calc-row span {
            color: var(--text-dark);
          }

          html.dark .step-number {
            background-color: var(--border-dark);
            color: var(--text-muted);
          }

          html.dark .step.active .step-number {
            background-color: var(--secondary);
            color: var(--background-dark);
          }

          html.dark .step-label {
            color: var(--text-muted);
          }

          html.dark .step.active .step-label {
            color: var(--text-dark);
          }

          html.dark .calc-row.total {
            border-top-color: var(--border-dark);
          }

          html.dark .form-group input,
          html.dark .form-group select {
            background-color: var(--input-bg);
            border-color: var(--input-border);
            color: var(--text-dark);
          }

          html.dark .input-prefix {
            color: var(--text-muted);
          }

          html.dark .form-group input:focus,
          html.dark .form-group select:focus {
            border-color: var(--secondary);
            box-shadow: 0 0 0 3px rgba(246, 173, 85, 0.2);
          }

          html.dark .terms-notice {
            background-color: #2d3748;
            border-left-color: var(--secondary);
          }

          html.dark .terms-notice p,
          html.dark .field-hint {
            color: var(--text-muted);
          }

          html.dark .link {
            color: var(--secondary);
          }

          html.dark .btn-submit {
            background-color: var(--secondary);
            color: var(--background-dark);
          }

          html.dark .btn-submit:hover:not(:disabled) {
            background-color: var(--secondary-dark);
          }

          html.dark .btn-primary {
            background-color: var(--secondary);
            color: var(--background-dark);
          }

          html.dark .btn-primary:hover {
            background-color: var(--secondary-dark);
          }
        `}
      </style>

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
          {/* Application Form */}
          <div className="form-section">
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
          </div>
        </div>
      </div>
    </div>
  );
}