import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import '../shared/normalize.css'; // Assuming normalize.css exists for base styles
import './CustFunction.css'; // Importing CustFunction.css

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
                date_of_birth: profile.date_of_birth, // Send in BCE-MM-DD format
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

    if (loading) {
        return (
            <div className="cf-main-app-wrapper">
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-content" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="cf-cust-func-loading-message">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cf-main-app-wrapper">
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-content" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="cf-cust-func-error-message">{error}</p>
                        <button onClick={() => window.location.reload()} className="cf-cust-func-secondary-button" style={{ marginTop: '1rem' }}>
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cf-main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <div className="cf-cust-func-container">
                <div className="cf-cust-func-content">
                    <div className="cf-cust-func-card">
                        <div className="cf-cust-func-card-header">
                            <h2 className="cf-cust-func-card-title">Edit Profile</h2>
                        </div>
                        {successMessage && (
                            <div className="cf-cust-func-success-message">
                                {successMessage}
                            </div>
                        )}
                        {error && (
                            <div className="cf-cust-func-error-message">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="profile-edit-form">
                            <div className="cf-cust-func-form-group">
                                <label htmlFor="username" className="cf-cust-func-form-label">Username:</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={profile.username}
                                    onChange={handleChange}
                                    className="cf-cust-func-form-input"
                                    required
                                />
                            </div>
                            <div className="cf-cust-func-form-group">
                                <label htmlFor="first_name" className="cf-cust-func-form-label">First Name:</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={profile.first_name}
                                    onChange={handleChange}
                                    className="cf-cust-func-form-input"
                                    required
                                />
                            </div>
                            <div className="cf-cust-func-form-group">
                                <label htmlFor="last_name" className="cf-cust-func-form-label">Last Name:</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={profile.last_name}
                                    onChange={handleChange}
                                    className="cf-cust-func-form-input"
                                    required
                                />
                            </div>
                            <div className="cf-cust-func-form-group">
                                <label htmlFor="date_of_birth" className="cf-cust-func-form-label">Date of Birth:</label>
                                <input
                                    type="date"
                                    id="date_of_birth"
                                    name="date_of_birth"
                                    value={profile.date_of_birth}
                                    onChange={handleChange}
                                    className="cf-cust-func-form-input"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="cf-cust-func-form-group">
                                <label htmlFor="phone_no" className="cf-cust-func-form-label">Phone Number:</label>
                                <input
                                    type="tel"
                                    id="phone_no"
                                    name="phone_no"
                                    value={profile.phone_no}
                                    onChange={handleChange}
                                    className="cf-cust-func-form-input"
                                    pattern="[0-9]{10,15}"
                                    title="Phone number should be 10-15 digits"
                                />
                            </div>
                            <div className="cf-cust-func-form-group">
                                <label htmlFor="home_address" className="cf-cust-func-form-label">Home Address:</label>
                                <textarea
                                    id="home_address"
                                    name="home_address"
                                    value={profile.home_address}
                                    onChange={handleChange}
                                    className="cf-cust-func-form-input"
                                    rows={3}
                                ></textarea>
                            </div>
                            <div className="cf-cust-func-form-group">
                                <label htmlFor="nationality" className="cf-cust-func-form-label">Nationality:</label>
                                <input
                                    type="text"
                                    id="nationality"
                                    name="nationality"
                                    value={profile.nationality}
                                    onChange={handleChange}
                                    className="cf-cust-func-form-input"
                                />
                            </div>
                            <div className="cf-cust-func-form-group">
                                <label className="cf-cust-func-form-label">IC Number:</label>
                                <input type="text" value={profile.ic_no || 'N/A'} disabled className="cf-cust-func-form-input" />
                            </div>
                            <div className="cf-cust-func-form-group">
                                <label className="cf-cust-func-form-label">Passport Number:</label>
                                <input type="text" value={profile.passport_no || 'N/A'} disabled className="cf-cust-func-form-input" />
                            </div>
                            <button type="submit" className="cf-cust-func-primary-button" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}