import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';
// Removed external CSS imports due to compilation errors
// import '../shared/normalize.css'; 
// import './CustFunction.css'; 

export default function Cust_Edit_Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [profile, setProfile] = useState({
        customer_id: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        phone_no: '',
        home_address: '',
        nationality: '',
        username: '',
        ic_no: '',
        passport_no: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    throw new Error('No active session. Please log in.');
                }
                const userUuid = session.user.id;

                const { data, error: profileError } = await supabase
                    .from('Customer')
                    .select('*')
                    .eq('user_uuid', userUuid)
                    .single();

                if (profileError || !data) {
                    throw new Error(`Error fetching profile: ${profileError?.message}`);
                }

                setProfile({
                    customer_id: data.customer_id,
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '', // Format date for input type="date"
                    phone_no: data.phone_no || '',
                    home_address: data.home_address || '',
                    nationality: data.nationality || '',
                    username: data.username || '',
                    ic_no: data.ic_no || '',
                    passport_no: data.passport_no || '',
                });

            } catch (err: any) {
                console.error('Error fetching profile:', err.message);
                setError(`Error: ${err.message}`);
                if (err.message.includes('No active session') || err.message.includes('Unauthorized')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error('No active session. Please log in.');
            }
            const userUuid = session.user.id;

            const updateData = {
                first_name: profile.first_name,
                last_name: profile.last_name,
                date_of_birth: profile.date_of_birth, // Send in YYYY-MM-DD format
                phone_no: profile.phone_no,
                home_address: profile.home_address,
                nationality: profile.nationality,
                username: profile.username,
                // ic_no and passport_no are intentionally not updated as they are disabled/read-only in the form
            };

            const { error: updateError } = await supabase
                .from('Customer')
                .update(updateData)
                .eq('user_uuid', userUuid);

            if (updateError) {
                throw new Error(`Error updating profile: ${updateError.message}`);
            }

            setSuccessMessage('Profile updated successfully!');
        } catch (err: any) {
            console.error('Error updating profile:', err.message);
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cf-main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
                {`
                    :root {
                        --cf-bg-primary: #f8f9fa;
                        --cf-bg-secondary: #fff;
                        --cf-text-primary: #333;
                        --cf-text-secondary: #666;
                        --cf-text-light: #888;
                        --cf-card-border: #e0e0e0;
                        --cf-box-shadow-light: rgba(0, 0, 0, 0.05);
                        --cf-box-shadow-medium: rgba(0, 0, 0, 0.1);

                        --cf-blue-accent: #007bff;
                        --cf-blue-accent-hover: #0056b3;
                        --cf-blue-accent-rgb: 0, 123, 255;

                        --cf-green-success: #28a745;
                        --cf-green-success-rgb: 40, 167, 69;

                        --cf-red-error: #dc3545;
                        --cf-red-error-rgb: 220, 53, 69;

                        --cf-disabled-input-bg: #e9ecef;

                        --cf-modal-overlay-bg: rgba(0, 0, 0, 0.6);
                        --cf-modal-bg: var(--cf-bg-secondary);
                        --cf-modal-border: var(--cf-card-border);
                        --cf-modal-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
                        --cf-modal-text: var(--cf-text-primary);
                        --cf-modal-text-secondary: var(--cf-text-secondary);
                    }

                    body.dark-mode {
                        --cf-bg-primary: #2d2d2d;
                        --cf-bg-secondary: #1a1a1a;
                        --cf-text-primary: #e0e0e0;
                        --cf-text-secondary: #b0b0b0;
                        --cf-text-light: #999;
                        --cf-card-border: #444;
                        --cf-box-shadow-light: rgba(255, 255, 255, 0.05);
                        --cf-box-shadow-medium: rgba(255, 255, 255, 0.1);

                        --cf-blue-accent: #5b9bd5;
                        --cf-blue-accent-hover: #3a7bbd;
                        --cf-blue-accent-rgb: 91, 155, 213;

                        --cf-green-success: #4CAF50;
                        --cf-green-success-rgb: 76, 175, 80;

                        --cf-red-error: #EF5350;
                        --cf-red-error-rgb: 239, 83, 80;

                        --cf-disabled-input-bg: #3c3c3c;

                        --cf-modal-overlay-bg: rgba(0, 0, 0, 0.7);
                        --cf-modal-bg: var(--cf-bg-secondary);
                        --cf-modal-border: var(--cf-card-border);
                        --cf-modal-shadow: 0 8px 30px rgba(255, 255, 255, 0.15);
                        --cf-modal-text: var(--cf-text-primary);
                        --cf-modal-text-secondary: var(--cf-text-secondary);
                    }

                    /* Original styles from CustFunction.css */
                    html, body {
                        line-height: 1.15;
                        -webkit-text-size-adjust: 100%;
                        box-sizing: border-box;
                        font-family: 'Inter', sans-serif;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    *, *::before, *::after {
                        box-sizing: inherit;
                    }

                    .cf-main-app-wrapper {
                        display: flex;
                        flex-direction: column;
                        min-height: 100vh;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                    }

                    .cf-cust-func-container {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: center;
                        padding: 20px;
                        background-color: var(--cf-bg-primary);
                        color: var(--cf-text-primary);
                        transition: background-color 0.3s ease, color 0.3s ease;
                        box-sizing: border-box;
                    }

                    .cf-cust-func-content {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        padding-top: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .cf-cust-func-card {
                        background-color: var(--cf-bg-secondary);
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px var(--cf-box-shadow-medium);
                        transition: background-color 0.3s ease, box-shadow 0.3s ease;
                        width: 100%;
                        max-width: 750px;
                        margin-bottom: 30px;
                        box-sizing: border-box;
                    }

                    .cf-cust-func-card-header {
                        margin-bottom: 25px;
                        text-align: center;
                        
                    }

                    .cf-cust-func-card-title {
                        font-size: 2.2em;
                        font-weight: bold;
                        color: var(--cf-text-primary);
                        margin: 0;
                        text-align: center;
                    }

                    .profile-edit-form { /* Specific styling for this form */
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 15px 20px; /* Row gap, column gap */
                    }

                    @media (min-width: 600px) {
                        .profile-edit-form {
                            grid-template-columns: 1fr 1fr; /* Two columns on larger screens */
                        }
                    }

                    .cust-func-form-group { /* Changed from .form-group to .cust-func-form-group */
                        display: flex;
                        flex-direction: column;
                    }

                    .cust-func-form-group label { /* Changed from .form-group label to .cust-func-form-group label */
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: var(--cf-text-secondary);
                        font-size: 1em;
                    }

                    .cust-func-form-input { /* Changed from .form-group input, etc. to .cust-func-form-input */
                        padding: 12px;
                        border: 1px solid var(--cf-card-border);
                        border-radius: 8px;
                        font-size: 1em;
                        color: var(--cf-text-primary);
                        background-color: var(--cf-bg-primary);
                        transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .cust-func-form-input:focus { /* Changed selector */
                        border-color: var(--cf-blue-accent);
                        outline: none;
                        box-shadow: 0 0 0 3px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-form-input:disabled { /* Changed selector */
                        background-color: var(--cf-disabled-input-bg) !important;
                        cursor: not-allowed;
                        opacity: 0.8;
                    }

                    .cust-func-primary-button { /* Changed selector from .profile-edit-form button[type="submit"] */
                        grid-column: 1 / -1; /* Make button span all columns */
                        padding: 14px 25px;
                        border: none;
                        border-radius: 8px;
                        font-size: 1.1em;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
                        min-width: 150px;
                        text-align: center;
                        background-color: var(--cf-blue-accent);
                        color: white;
                        box-shadow: 0 4px 10px rgba(var(--cf-blue-accent-rgb), 0.2);
                        margin-top: 25px;
                    }

                    .cust-func-primary-button:hover { /* Changed selector */
                        background-color: var(--cf-blue-accent-hover);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px rgba(var(--cf-blue-accent-rgb), 0.3);
                    }

                    .cust-func-primary-button:active { /* Changed selector */
                        transform: translateY(0);
                        box-shadow: 0 2px 5px rgba(var(--cf-blue-accent-rgb), 0.2);
                    }

                    .cust-func-primary-button:disabled { /* Changed selector */
                        background-color: #cccccc;
                        color: #666666;
                        cursor: not-allowed;
                        box-shadow: none;
                    }

                    .cust-func-loading-message, .cust-func-error-message, .cust-func-success-message { /* Changed selectors */
                        text-align: center;
                        padding: 12px;
                        margin-bottom: 20px;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 0.95em;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .cust-func-loading-message { /* Changed selector */
                        color: var(--cf-text-primary);
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.1);
                        border: 1px solid var(--cf-blue-accent);
                    }

                    .cust-func-error-message { /* Changed selector */
                        color: var(--cf-red-error);
                        background-color: rgba(var(--cf-red-error-rgb), 0.1);
                        border: 1px solid var(--cf-red-error);
                    }

                    .cust-func-success-message { /* Changed selector */
                        color: var(--cf-green-success);
                        background-color: rgba(var(--cf-green-success-rgb), 0.1);
                        border: 1px solid var(--cf-green-success);
                    }

                    .cust-func-secondary-button { /* Changed selector */
                        background-color: transparent;
                        color: var(--cf-blue-accent);
                        border: 1px solid var(--cf-blue-accent);
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-size: 1em;
                        cursor: pointer;
                        transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease;
                    }
                    .cust-func-secondary-button:hover { /* Changed selector */
                        background-color: rgba(var(--cf-blue-accent-rgb), 0.05);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    }
                    .cust-func-secondary-button:active { /* Changed selector */
                        transform: translateY(0);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }

                    /* Specific style adjustment for error message button alignment */
                    .cf-cust-func-container > div[style*="padding: 2rem"] {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                `}
            </style>
            {loading && (
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-content" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="cust-func-loading-message">Loading profile...</p>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-content" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="cust-func-error-message">{error}</p>
                        <button onClick={() => window.location.reload()} className="cust-func-secondary-button" style={{ marginTop: '1rem' }}>
                            Reload Page
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && (
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-content">
                        <div className="cf-cust-func-card">
                            <div className="cf-cust-func-card-header">
                                <h2 className="cf-cust-func-card-title">Edit Profile</h2>
                            </div>
                            {successMessage && (
                                <div className="cust-func-success-message">
                                    {successMessage}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="profile-edit-form">
                                <div className="cust-func-form-group">
                                    <label htmlFor="username" className="cust-func-form-label">Username:</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={profile.username}
                                        onChange={handleChange}
                                        className="cust-func-form-input"
                                        required
                                    />
                                </div>
                                <div className="cust-func-form-group">
                                    <label htmlFor="first_name" className="cust-func-form-label">First Name:</label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        name="first_name"
                                        value={profile.first_name}
                                        onChange={handleChange}
                                        className="cust-func-form-input"
                                        required
                                    />
                                </div>
                                <div className="cust-func-form-group">
                                    <label htmlFor="last_name" className="cust-func-form-label">Last Name:</label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        name="last_name"
                                        value={profile.last_name}
                                        onChange={handleChange}
                                        className="cust-func-form-input"
                                        required
                                    />
                                </div>
                                <div className="cust-func-form-group">
                                    <label htmlFor="date_of_birth" className="cust-func-form-label">Date of Birth:</label>
                                    <input
                                        type="date"
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        value={profile.date_of_birth}
                                        onChange={handleChange}
                                        className="cust-func-form-input"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="cust-func-form-group">
                                    <label htmlFor="phone_no" className="cust-func-form-label">Phone Number:</label>
                                    <input
                                        type="tel"
                                        id="phone_no"
                                        name="phone_no"
                                        value={profile.phone_no}
                                        onChange={handleChange}
                                        className="cust-func-form-input"
                                        pattern="[0-9]{10,15}"
                                        title="Phone number should be 10-15 digits"
                                    />
                                </div>
                                <div className="cust-func-form-group">
                                    <label htmlFor="home_address" className="cust-func-form-label">Home Address:</label>
                                    <textarea
                                        id="home_address"
                                        name="home_address"
                                        value={profile.home_address}
                                        onChange={handleChange}
                                        className="cust-func-form-input"
                                        rows={3}
                                    ></textarea>
                                </div>
                                <div className="cust-func-form-group">
                                    <label htmlFor="nationality" className="cust-func-form-label">Nationality:</label>
                                    <input
                                        type="text"
                                        id="nationality"
                                        name="nationality"
                                        value={profile.nationality}
                                        onChange={handleChange}
                                        className="cust-func-form-input"
                                    />
                                </div>
                                <div className="cust-func-form-group">
                                    <label className="cust-func-form-label">IC Number:</label>
                                    <input type="text" value={profile.ic_no || 'N/A'} disabled className="cust-func-form-input" />
                                </div>
                                <div className="cust-func-form-group">
                                    <label className="cust-func-form-label">Passport Number:</label>
                                    <input type="text" value={profile.passport_no || 'N/A'} disabled className="cust-func-form-input" />
                                </div>
                                <button type="submit" className="cust-func-primary-button" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}