import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react"; // For the back button icon
import supabase from '../supabaseClient.js'; // Assuming supabase client is correctly configured
import DarkModeToggle from './DarkModeToggle.tsx'; // Assuming this component exists in shared folder

// Define the props interface for the Header component
interface HeaderProps {
    showBackButton?: boolean; // Optional: true to show back button, false to hide
    // backPath?: string; // Removed, as navigate(-1) will be the default 'back' action
    showSignOutButton?: boolean; // Optional: true to show sign out button, false to hide
}

// Removed backPath from default props, as it's not strictly needed for navigate(-1) behavior
const Header: React.FC<HeaderProps> = ({ showBackButton = false, showSignOutButton = true }) => {
    const navigate = useNavigate();

    // Handles navigation for the back button
    const handleGoBack = () => {
        // If showBackButton is true, the intention is usually to go back in history.
        // navigate(-1) achieves this. If you ever need a specific fixed path,
        // you would reintroduce backPath and its conditional logic.
        navigate(-1);
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
                    {/* Display logo text only when back button is NOT shown */}
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
console.log('Header component rendered'); //
export default Header;