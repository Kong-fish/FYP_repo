import React from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js'; // Assuming this path is correct
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
    showBackButton?: boolean;
    showSignOutButton?: boolean; // Renamed from showSignOut to showSignOutButton for clarity and consistency
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, showSignOutButton = true }) => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/'); // Redirect to customer landing after sign out
        }
    };

    const handleBack = () => {
        navigate(-1); // Navigate back to the previous page in history
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
                    {/* Assuming DarkModeToggle is a separate component and import path is correct */}
                    {/* <DarkModeToggle /> */}
                    {showSignOutButton && (
                        <button onClick={handleSignOut} className="sign-out-button header-sign-out-btn">
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;