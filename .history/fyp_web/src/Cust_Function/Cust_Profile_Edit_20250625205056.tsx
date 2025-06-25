import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import { ArrowLeft } from 'lucide-react'; // For the back button icon

// Import shared CSS files
import '../shared/Header.css';
import '../shared/normalize.css';
import './CustFunction.css'; // Specific styles for customer functions

import DarkModeToggle from '../shared/DarkModeToggle'; // Assuming this is a separate component

// Re-use the Header component for consistency across pages
interface HeaderProps {
    showBackButton?: boolean;
    backPath?: string;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, backPath = '/' }) => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/customer-landing'); // Redirect to customer landing after sign out
        }
    };

    const handleBack = () => {
        navigate(backPath); // Navigate to the specified backPath
    };

    return (
        <header className="header">
            <div className="header__content">
                {/* Back Button with text */}
                {showBackButton && (
                    <button onClick={handleBack} className="back-button">
                        <ArrowLeft size={24} />
                        <span className="back-button-text">Back</span>
                    </button>
                )}

                <div className="logo-section">
                    <h1 className="logo-text">Eminent Western</h1>
                </div>
                <nav className="header-nav"></nav>
                <div className="header-actions">
                    <DarkModeToggle /> {/* Reusing the DarkModeToggle component */}
                    <button onClick={handleSignOut} className="sign-out-button header-sign-out-btn">
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};


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
                    date_of_birth: data.date_of_birth || '',
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
                    navigate('/customer-landing');
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
                date_of_birth: profile.date_of_birth,
                phone_no: profile.phone_no,
                home_address: profile.home_address,
                nationality: profile.nationality,
                username: profile.username,
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
            <div className="main-app-wrapper">
                <Header showBackButton={true} backPath="/customer-dashboard" />
                <div className="dashboard-container">
                    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p className="loading-message">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-app-wrapper">
                <Header showBackButton={true} backPath="/customer-dashboard" />
                <div className="dashboard-container">
                    <div className="container" style={{ padding: '2rem', textAlign: 'center', color: 'var(--error-color)' }}>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="secondary-button" style={{ marginTop: '1rem' }}>
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <Header showBackButton={true} backPath="/customer-dashboard" /> {/* Pass props for back button */}
            <div className="dashboard-container">
                <div className="dashboard-main container">
                    <div className="dashboard-layout">
                        <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto', width: '95%' }}>
                            <div className="transactions-card">
                                <div className="transactions-content">
                                    <div className="transactions-header">
                                        <h2 className="transactions-title">Edit Profile</h2>
                                    </div>
                                    {successMessage && (
                                        <div className="success-message">
                                            {successMessage}
                                        </div>
                                    )}
                                    {error && (
                                        <div className="error-message">
                                            {error}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit} className="profile-edit-form">
                                        <div className="form-group">
                                            <label htmlFor="username">Username:</label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={profile.username}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="first_name">First Name:</label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                value={profile.first_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="last_name">Last Name:</label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                value={profile.last_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="date_of_birth">Date of Birth:</label>
                                            <input
                                                type="date"
                                                id="date_of_birth"
                                                name="date_of_birth"
                                                value={profile.date_of_birth}
                                                onChange={handleChange}
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone_no">Phone Number:</label>
                                            <input
                                                type="tel"
                                                id="phone_no"
                                                name="phone_no"
                                                value={profile.phone_no}
                                                onChange={handleChange}
                                                pattern="[0-9]{10,15}"
                                                title="Phone number should be 10-15 digits"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="home_address">Home Address:</label>
                                            <textarea
                                                id="home_address"
                                                name="home_address"
                                                value={profile.home_address}
                                                onChange={handleChange}
                                                rows={3}
                                            ></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="nationality">Nationality:</label>
                                            <input
                                                type="text"
                                                id="nationality"
                                                name="nationality"
                                                value={profile.nationality}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>IC Number:</label>
                                            <input type="text" value={profile.ic_no || 'N/A'} disabled />
                                        </div>
                                        <div className="form-group">
                                            <label>Passport Number:</label>
                                            <input type="text" value={profile.passport_no || 'N/A'} disabled />
                                        </div>
                                        <button type="submit" className="primary-button" disabled={loading}>
                                            {loading ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="dashboard-footer">
                    <div className="footer-content">
                        <p className="footer-copyright">© 2025 Eminent Western. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#" className="footer-link">Privacy</a>
                            <a href="#" className="footer-link">Terms</a>
                            <a href="#" className="footer-link">Help</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}