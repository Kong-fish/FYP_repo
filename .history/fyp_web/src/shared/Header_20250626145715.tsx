import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react"; // For the back button icon
import supabase from '../supbaseClient.js'; // Assuming supabase client is correctly configured
import DarkModeToggle from './DarkModeToggle.tsx'; // Assuming this component exists in shared folder

// Define the props interface for the Header component
interface HeaderProps {
    showBackButton?: boolean; // Optional: true to show back button, false to hide
    backPath?: string;        // Optional: The path to navigate back to if showBackButton is true
    showSignOutButton?: boolean; // Optional: true to show sign out button, false to hide
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, backPath = '/', showSignOutButton = true }) => {
    const navigate = useNavigate();

    // Handles navigation for the back button
    const handleGoBack = () => {
        if (backPath) {
            navigate(backPath);
        } else {
            // Fallback: if no specific backPath is provided, go back in history
            navigate(-1);
        }
    };

    // Handles user sign out
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
            // Optionally, display a user-friendly error message
        } else {
            // Navigate to the landing page or login page after successful sign out
            navigate('/');
        }
    };

    return (
        <header className="header">
            <div className="header__content">
                <div className="logo-section">
                    {/* Conditionally render the back button */}
                    {showBackButton && (
                        <button onClick={handleGoBack} className="back-button">
                            <ArrowLeft size={24} /> {/* Lucide React arrow icon */}
                            <span className="back-button-text">Back</span>
                        </button>
                    )}
                    {!showBackButton && (
                        <span className="logo-text header__title">Eminent Western</span>
                    )}
                </div>
                <div className="header-actions">
                    <DarkModeToggle />
                    {/* Conditionally render the sign-out button */}
                    {showSignOutButton && (
                        <button onClick={handleSignOut} className="sign-out-button">
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
