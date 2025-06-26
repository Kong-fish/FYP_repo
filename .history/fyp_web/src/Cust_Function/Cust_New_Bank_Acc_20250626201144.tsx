import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';

import '../shared/normalize.css';
import './CustFunction.css'; 

function Cust_New_Bank_Acc() {
    const navigate = useNavigate();
    const [customer_id, setCustomerId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null); // State for submission error
    const [isSuccess, setIsSuccess] = useState<boolean>(false); // State for success message

    // Form data state
    const [formData, setFormData] = useState({
        cardType: '',
        income: '',
        employmentStatus: '',
        residenceType: '',
        monthlyExpenses: '',
        existingDebt: '',
        creditScore: '',
        purpose: '',
    });

    useEffect(() => {
        const getCustomerId = async () => {
            setLoading(true);
            setSubmitError(null); // Clear any previous submission errors

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Error fetching session:', sessionError.message);
                setSubmitError('Failed to retrieve user session. Please try logging in again.');
                navigate('/customer-login');
                return;
            }

            if (!session) {
                setSubmitError('You are not logged in. Redirecting to login page.');
                navigate('/customer-login');
                return;
            }

            const { user } = session;

            // Fetch customer_id from the Customer table using user_uuid
            const { data, error } = await supabase
                .from('Customer')
                .select('customer_id')
                .eq('user_uuid', user.id)
                .single();

            if (error) {
                console.error('Error fetching customer ID:', error.message);
                setSubmitError('Error fetching customer profile. Please ensure your profile is complete.');
                navigate('/customer-login'); // Or an error page
                return;
            }

            if (data) {
                setCustomerId(data.customer_id);
            } else {
                setSubmitError('Customer profile not found. Please ensure your profile details are filled out on your dashboard.');
                // Optionally redirect to profile completion page
                // navigate('/customer-profile-setup');
            }
            setLoading(false);
        };

        getCustomerId();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Clear general submission error when user starts typing
        if (submitError) {
            setSubmitError(null);
        }
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formData.cardType) errors.cardType = 'Card Type is required.';
        if (!formData.income || parseFloat(formData.income) <= 0) errors.income = 'Valid income is required.';
        if (!formData.employmentStatus) errors.employmentStatus = 'Employment Status is required.';
        if (!formData.residenceType) errors.residenceType = 'Residence Type is required.';
        if (!formData.monthlyExpenses || parseFloat(formData.monthlyExpenses) < 0) errors.monthlyExpenses = 'Valid monthly expenses are required.';
        if (!formData.existingDebt || parseFloat(formData.existingDebt) < 0) errors.existingDebt = 'Valid existing debt is required.';
        if (!formData.creditScore || !/^\d+$/.test(formData.creditScore) || parseInt(formData.creditScore) < 300 || parseInt(formData.creditScore) > 850) errors.creditScore = 'Valid credit score (300-850) is required.';
        if (!formData.purpose) errors.purpose = 'Purpose is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null); // Clear previous submission errors
        setIsSuccess(false); // Reset success state

        if (!validateForm()) {
            setSubmitError("Please correct the errors in the form before submitting.");
            return;
        }

        if (!customer_id) {
            setSubmitError('Customer ID not found. Please log in again or complete your profile.');
            // Optionally redirect
            // navigate('/customer-login');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('Credit_Card_Application')
                .insert([
                    {
                        customer_id: customer_id,
                        card_type: formData.cardType,
                        income: parseFloat(formData.income),
                        employment_status: formData.employmentStatus,
                        residence_type: formData.residenceType,
                        monthly_expenses: parseFloat(formData.monthlyExpenses),
                        existing_debt: parseFloat(formData.existingDebt),
                        credit_score: parseInt(formData.creditScore),
                        purpose: formData.purpose,
                        application_date: new Date().toISOString(),
                        status: 'Pending', // Initial status
                    },
                ])
                .select();

            if (error) {
                throw error;
            }

            console.log('Application submitted:', data);
            setIsSuccess(true);
            // Navigate to success page
            navigate('/credit-card-pending-approval'); // Assuming this page exists
            
            // Optionally clear form after successful submission if not navigating immediately
            // setFormData({
            //     cardType: '', income: '', employmentStatus: '', residenceType: '',
            //     monthlyExpenses: '', existingDebt: '', creditScore: '', purpose: '',
            // });

        } catch (error: any) {
            console.error('Error submitting application:', error.message);
            setSubmitError(`Failed to submit application: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cf-main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <header className="loan-header"> {/* Reusing loan-header for consistent branding */}
                <div className="container">
                    <div className="header-content">
                        <div className="header-title">
                            <h1>New Credit Card Application</h1> {/* Specific title for this page */}
                        </div>
                        <div className="logo-section">
                            {/* Using a placeholder image for demonstration */}
                            <img src="https://placehold.co/150x50/cccccc/333333?text=Logo" alt="Eminent Western Logo" className="logo-image" 
                                onError={(e) => { e.currentTarget.src = "https://placehold.co/150x50/cccccc/333333?text=Logo"; }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="cf-cust-func-container">
                {loading ? (
                    <div className="cf-cust-func-card p-6 cf-text-center">
                        <p className="cf-text-secondary">Loading user data...</p>
                    </div>
                ) : (
                    <div className="form-section"> {/* Using form-section for consistent styling */}
                        <div className="form-section-card"> {/* Using form-section-card for the main form container */}
                            <h2 className="section-title">Apply for a New Credit Card</h2>

                            {submitError && (
                                <div className="cf-cust-func-error-message">
                                    {submitError}
                                </div>
                            )}
                            {isSuccess && (
                                <div className="cf-cust-func-success-message">
                                    Your credit card application has been submitted successfully!
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="cf-cust-func-form">
                                {/* Removed form-row divs. The grid handles the layout directly */}
                                
                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="cardType" className="cf-cust-func-form-label">Preferred Card Type:</label>
                                    <select
                                        id="cardType"
                                        name="cardType"
                                        value={formData.cardType}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.cardType ? 'error' : ''}`}
                                        required
                                    >
                                        <option value="">Select a card type</option>
                                        <option value="Platinum Rewards">Platinum Rewards</option>
                                        <option value="Emerald Cashback">Emerald Cashback</option>
                                        <option value="Sapphire Travel">Sapphire Travel</option>
                                    </select>
                                    {formErrors.cardType && <p className="error-message">{formErrors.cardType}</p>}
                                </div>

                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="income" className="cf-cust-func-form-label">Annual Income ($):</label>
                                    <input
                                        type="number"
                                        id="income"
                                        name="income"
                                        value={formData.income}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.income ? 'error' : ''}`}
                                        placeholder="e.g., 50000"
                                        min="0"
                                        required
                                    />
                                    {formErrors.income && <p className="error-message">{formErrors.income}</p>}
                                </div>

                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="employmentStatus" className="cf-cust-func-form-label">Employment Status:</label>
                                    <select
                                        id="employmentStatus"
                                        name="employmentStatus"
                                        value={formData.employmentStatus}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.employmentStatus ? 'error' : ''}`}
                                        required
                                    >
                                        <option value="">Select status</option>
                                        <option value="Employed">Employed</option>
                                        <option value="Self-Employed">Self-Employed</option>
                                        <option value="Unemployed">Unemployed</option>
                                        <option value="Student">Student</option>
                                        <option value="Retired">Retired</option>
                                    </select>
                                    {formErrors.employmentStatus && <p className="error-message">{formErrors.employmentStatus}</p>}
                                </div>

                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="residenceType" className="cf-cust-func-form-label">Residence Type:</label>
                                    <select
                                        id="residenceType"
                                        name="residenceType"
                                        value={formData.residenceType}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.residenceType ? 'error' : ''}`}
                                        required
                                    >
                                        <option value="">Select type</option>
                                        <option value="Own Home">Own Home</option>
                                        <option value="Rent">Rent</option>
                                        <option value="Live with Parents">Live with Parents</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {formErrors.residenceType && <p className="error-message">{formErrors.residenceType}</p>}
                                </div>

                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="monthlyExpenses" className="cf-cust-func-form-label">Monthly Expenses ($):</label>
                                    <input
                                        type="number"
                                        id="monthlyExpenses"
                                        name="monthlyExpenses"
                                        value={formData.monthlyExpenses}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.monthlyExpenses ? 'error' : ''}`}
                                        placeholder="e.g., 1500"
                                        min="0"
                                        required
                                    />
                                    {formErrors.monthlyExpenses && <p className="error-message">{formErrors.monthlyExpenses}</p>}
                                </div>

                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="existingDebt" className="cf-cust-func-form-label">Existing Debt ($):</label>
                                    <input
                                        type="number"
                                        id="existingDebt"
                                        name="existingDebt"
                                        value={formData.existingDebt}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.existingDebt ? 'error' : ''}`}
                                        placeholder="e.g., 5000"
                                        min="0"
                                        required
                                    />
                                    {formErrors.existingDebt && <p className="error-message">{formErrors.existingDebt}</p>}
                                </div>

                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="creditScore" className="cf-cust-func-form-label">Credit Score (300-850):</label>
                                    <input
                                        type="number"
                                        id="creditScore"
                                        name="creditScore"
                                        value={formData.creditScore}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.creditScore ? 'error' : ''}`}
                                        placeholder="e.g., 720"
                                        min="300"
                                        max="850"
                                        required
                                    />
                                    {formErrors.creditScore && <p className="error-message">{formErrors.creditScore}</p>}
                                </div>
                                {/* No need for empty div to maintain grid layout, as the grid handles it automatically */}

                                <div className="cf-cust-func-form-group full-width"> {/* This will span both columns */}
                                    <label htmlFor="purpose" className="cf-cust-func-form-label">Purpose of Credit Card:</label>
                                    <textarea
                                        id="purpose"
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.purpose ? 'error' : ''}`}
                                        placeholder="e.g., Daily spending, building credit, travel rewards"
                                        rows={3}
                                        required
                                    ></textarea>
                                    {formErrors.purpose && <p className="error-message">{formErrors.purpose}</p>}
                                </div>

                                <div className="cf-cust-func-button-group">
                                    <button type="submit" className="cf-cust-func-primary-button" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <span className="loading-spinner"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Application'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cust_New_Bank_Acc;