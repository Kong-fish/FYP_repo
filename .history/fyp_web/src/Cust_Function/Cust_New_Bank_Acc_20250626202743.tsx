import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import '../shared/normalize.css';
import './CustFunction.css';

function Cust_New_Bank_Account_Application() {
    const navigate = useNavigate();
    const [customer_id, setCustomerId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null); // State for submission error
    const [isSuccess, setIsSuccess] = useState<boolean>(false); // State for success message

    // Form data state updated for bank account application
    const [formData, setFormData] = useState({
        accountType: '',
        initialBalance: '',
        nickname: '',
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
                navigate('/customer-login'); // Or an page for profile completion
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
        if (!formData.accountType) errors.accountType = 'Account Type is required.';
        if (!formData.initialBalance || parseFloat(formData.initialBalance) <= 0) errors.initialBalance = 'Valid initial balance is required.';
        if (!formData.nickname) errors.nickname = 'Account Nickname is required.';
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
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('Account') // Inserting into the "Account" table
                .insert([
                    {
                        customer_id: customer_id,
                        account_type: formData.accountType,
                        balance: parseFloat(formData.initialBalance),
                        nickname: formData.nickname,
                        // account_no, account_status, created_at, approved_at, favourite_accounts
                        // are handled by database defaults or will be set later.
                    },
                ])
                .select();

            if (error) {
                throw error;
            }

            console.log('Account application submitted:', data);
            setIsSuccess(true);
            // Navigate to the success page as requested
            navigate('/customer-new-account-success'); 
            
            // Optionally clear form after successful submission if not navigating immediately
            // setFormData({
            //     accountType: '', initialBalance: '', nickname: '',
            // });

        } catch (error: any) {
            console.error('Error submitting account application:', error.message);
            setSubmitError(`Failed to submit account application: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cf-main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <header className="loan-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-title">
                            <h1>New Bank Account Application</h1> {/* Specific title for this page */}
                        </div>
                        <div className="logo-section">
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
                    <div className="form-section">
                        <div className="form-section-card">
                            <h2 className="section-title">Apply for a New Bank Account</h2>

                            {submitError && (
                                <div className="cf-cust-func-error-message">
                                    {submitError}
                                </div>
                            )}
                            {isSuccess && (
                                <div className="cf-cust-func-success-message">
                                    Your bank account application has been submitted successfully!
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="cf-cust-func-form">
                                
                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="accountType" className="cf-cust-func-form-label">Preferred Account Type:</label>
                                    <select
                                        id="accountType"
                                        name="accountType"
                                        value={formData.accountType}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.accountType ? 'error' : ''}`}
                                        required
                                    >
                                        <option value="">Select an account type</option>
                                        <option value="Savings">Savings Account</option>
                                        <option value="Current">Current Account</option>
                                        <option value="Fixed Deposit">Fixed Deposit Account</option>
                                    </select>
                                    {formErrors.accountType && <p className="error-message">{formErrors.accountType}</p>}
                                </div>

                                <div className="cf-cust-func-form-group">
                                    <label htmlFor="initialBalance" className="cf-cust-func-form-label">Initial Deposit ($):</label>
                                    <input
                                        type="number"
                                        id="initialBalance"
                                        name="initialBalance"
                                        value={formData.initialBalance}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.initialBalance ? 'error' : ''}`}
                                        placeholder="e.g., 500.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    {formErrors.initialBalance && <p className="error-message">{formErrors.initialBalance}</p>}
                                </div>

                                <div className="cf-cust-func-form-group full-width"> {/* Make nickname full width as there's only one remaining field */}
                                    <label htmlFor="nickname" className="cf-cust-func-form-label">Account Nickname:</label>
                                    <input
                                        type="text"
                                        id="nickname"
                                        name="nickname"
                                        value={formData.nickname}
                                        onChange={handleChange}
                                        className={`cf-cust-func-form-input ${formErrors.nickname ? 'error' : ''}`}
                                        placeholder="e.g., My Personal Savings"
                                        required
                                    />
                                    {formErrors.nickname && <p className="error-message">{formErrors.nickname}</p>}
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

export default Cust_New_Bank_Account_Application;