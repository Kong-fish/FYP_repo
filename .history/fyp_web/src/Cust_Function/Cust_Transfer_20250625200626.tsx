"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { ArrowLeft } from "lucide-react"; // Import the ArrowLeft icon
import "../shared/Header.css"
import "../shared/normalize.css"
import './Cust_Function.css'; // This CSS file contains the styling for the form and the new header elements
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

// Header Component (modified to include back button and logo, made consistent with Cust_Transfer)
const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/customer-landing'); // Redirect to landing page after sign out
        }
    };

    // Function to navigate back to the customer dashboard
    const handleBack = () => {
        navigate("/customer-dashboard");
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
                    <span className="logo-icon">🏦</span> {/* Icon for the logo */}
                    <h1 className="logo-text">Eminent Western</h1>
                </div>
                <nav className="header-nav">
                    {/* Assuming this is for other navigation items if any */}
                </nav>
                <div className="header-actions">
                    <DarkModeToggle />
                    <button onClick={handleSignOut} className="sign-out-button header-sign-out-btn">
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};


function Cust_New_CC() {
    const navigate = useNavigate();
    const [customer_id, setCustomerId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Error fetching session:', sessionError.message);
                navigate('/customer-login');
                return;
            }

            if (!session) {
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
                // Handle case where customer profile might not be found
                navigate('/customer-login'); // Or an error page
                return;
            }

            if (data) {
                setCustomerId(data.customer_id);
            }
            setLoading(false);
        };

        getCustomerId();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error message for the field being changed
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
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
        // Validate credit score: must be a number between 300 and 850
        if (!formData.creditScore || !/^\d+$/.test(formData.creditScore) || parseInt(formData.creditScore) < 300 || parseInt(formData.creditScore) > 850) errors.creditScore = 'Valid credit score (300-850) is required.';
        if (!formData.purpose) errors.purpose = 'Purpose is required.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        if (!customer_id) {
            alert('Customer ID not found. Please log in again.');
            navigate('/customer-login');
            return;
        }

        setIsSubmitting(true); // Disable button during submission

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
                        status: 'Pending', // Initial status for a new application
                    },
                ])
                .select(); // Use .select() to retrieve the inserted data

            if (error) {
                throw error;
            }

            console.log('Application submitted successfully:', data);
            // Navigate to a success/pending approval page
            navigate('/credit-card-pending-approval');

        } catch (error: any) {
            console.error('Error submitting application:', error.message);
            alert(`Failed to submit application: ${error.message}`); // Show user-friendly error
        } finally {
            setIsSubmitting(false); // Re-enable button after submission attempt
        }
    };

    // Show loading state while fetching customer ID
    if (loading) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p className="loading-message">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-app-wrapper">
            <Header />
            <div className="container form-container">
                <div className="transactions-card"> {/* Applying the general card style */}
                    <div className="transactions-content">
                        <div className="transactions-header">
                            <h2 className="transactions-title">Apply for a New Credit Card</h2>
                        </div>

                        {/* Display general form errors if any */}
                        {Object.keys(formErrors).length > 0 && formErrors.general && (
                            <div className="error-message-box">
                                {formErrors.general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="transfer-form"> {/* Reusing transfer-form for grid/flex layout */}
                            <div className="form-group">
                                <label htmlFor="cardType" className="form-label">Preferred Card Type:</label>
                                <select
                                    id="cardType"
                                    name="cardType"
                                    value={formData.cardType}
                                    onChange={handleChange}
                                    className={`form-input ${formErrors.cardType ? 'input-error' : ''}`}
                                    required
                                >
                                    <option value="">Select a card type</option>
                                    <option value="Platinum Rewards">Platinum Rewards</option>
                                    <option value="Emerald Cashback">Emerald Cashback</option>
                                    <option value="Sapphire Travel">Sapphire Travel</option>
                                </select>
                                {formErrors.cardType && <p className="error-message">{formErrors.cardType}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="income" className="form-label">Annual Income ($):</label>
                                <input
                                    type="number"
                                    id="income"
                                    name="income"
                                    value={formData.income}
                                    onChange={handleChange}
                                    className={`form-input ${formErrors.income ? 'input-error' : ''}`}
                                    placeholder="e.g., 50000"
                                    min="0"
                                    required
                                />
                                {formErrors.income && <p className="error-message">{formErrors.income}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="employmentStatus" className="form-label">Employment Status:</label>
                                <select
                                    id="employmentStatus"
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    onChange={handleChange}
                                    className={`form-input ${formErrors.employmentStatus ? 'input-error' : ''}`}
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

                            <div className="form-group">
                                <label htmlFor="residenceType" className="form-label">Residence Type:</label>
                                <select
                                    id="residenceType"
                                    name="residenceType"
                                    value={formData.residenceType}
                                    onChange={handleChange}
                                    className={`form-input ${formErrors.residenceType ? 'input-error' : ''}`}
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

                            <div className="form-group">
                                <label htmlFor="monthlyExpenses" className="form-label">Monthly Expenses ($):</label>
                                <input
                                    type="number"
                                    id="monthlyExpenses"
                                    name="monthlyExpenses"
                                    value={formData.monthlyExpenses}
                                    onChange={handleChange}
                                    className={`form-input ${formErrors.monthlyExpenses ? 'input-error' : ''}`}
                                    placeholder="e.g., 1500"
                                    min="0"
                                    required
                                />
                                {formErrors.monthlyExpenses && <p className="error-message">{formErrors.monthlyExpenses}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="existingDebt" className="form-label">Existing Debt ($):</label>
                                <input
                                    type="number"
                                    id="existingDebt"
                                    name="existingDebt"
                                    value={formData.existingDebt}
                                    onChange={handleChange}
                                    className={`form-input ${formErrors.existingDebt ? 'input-error' : ''}`}
                                    placeholder="e.g., 5000"
                                    min="0"
                                    required
                                />
                                {formErrors.existingDebt && <p className="error-message">{formErrors.existingDebt}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="creditScore" className="form-label">Credit Score (300-850):</label>
                                <input
                                    type="number"
                                    id="creditScore"
                                    name="creditScore"
                                    value={formData.creditScore}
                                    onChange={handleChange}
                                    className={`form-input ${formErrors.creditScore ? 'input-error' : ''}`}
                                    placeholder="e.g., 720"
                                    min="300"
                                    max="850"
                                    required
                                />
                                {formErrors.creditScore && <p className="error-message">{formErrors.creditScore}</p>}
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="purpose" className="form-label">Purpose of Credit Card:</label>
                                <textarea
                                    id="purpose"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    className={`form-input ${formErrors.purpose ? 'input-error' : ''}`}
                                    placeholder="e.g., Daily spending, building credit, travel rewards"
                                    rows={3}
                                    required
                                ></textarea>
                                {formErrors.purpose && <p className="error-message">{formErrors.purpose}</p>}
                            </div>

                            <div className="button-group"> {/* Reusing button-group for consistent button layout */}
                                <button type="submit" className="primary-button" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => navigate('/customer-dashboard')}
                                    disabled={isSubmitting}
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cust_Transfer;