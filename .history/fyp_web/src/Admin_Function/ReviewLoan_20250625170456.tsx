// src/shared/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Ensure lucide-react is installed: npm install lucide-react

interface HeaderProps {
  // You can add props if the header needs dynamic content or behavior
  showBackButton?: boolean;
  backButtonPath?: string;
  // currentPageTitle?: string; // If you want a dynamic title
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, backButtonPath = '/customer-dashboard' }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Implement your Supabase sign out logic here
    // For example:
    // const { error } = await supabase.auth.signOut();
    // if (error) {
    //   console.error('Error signing out:', error.message);
    // } else {
    //   navigate('/customer-landing'); // Redirect to login/landing page
    // }
    console.log('Sign out clicked (placeholder)');
    navigate('/customer-landing'); // Example redirect
  };

  const handleBack = () => {
    navigate(backButtonPath);
  };

  return (
    <header className="header">
      <div className="header__content">
        {showBackButton && ( // Optional back button
          <button onClick={handleBack} className="back-button">
            <ArrowLeft size={24} />
            <span className="back-button-text">Back</span>
          </button>
        )}
        <h1 className="header__title">Eminent Western</h1>
        <nav className="header-nav"></nav>
        <div className="header-actions">
          {/* DarkModeToggle component would go here if you have one */}
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;