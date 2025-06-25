"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import { ArrowLeft } from 'lucide-react';

import '../shared/Header.css';
import '../shared/normalize.css';
import './Cust_Function.css'; // For general styling of forms, cards, buttons
import './CustomerDashboard.css'; // For overall layout like dashboard-container, dashboard-main etc.
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

// Re-use the Header component for consistency across pages
const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/customer-landing');
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
                <nav className="header-nav"></nav>
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

// Interface for account information
interface AccountInfo {
    account_id: string;
    account_no: string;
    account_type: string;
    balance: number;
    nickname?: string;
}

// State for success message
const [successMessage, setSuccessMessage] = useState<string | null>(null);
function setSuccessMessage(arg0: null) {
    throw new Error('Function not implemented.');
}

