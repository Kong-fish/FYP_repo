import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import '../shared/normalize.css';
import './Login.css';
import '../shared/Header.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';
import { ArrowLeft } from "lucide-react";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header__content">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={24} />
          <span className="back-button-text">Back</span>
        </button>
        <div className="header__title">
          <p>Eminent Western</p>
        </div>
        <DarkModeToggle />
      </div>
    </header>
  );
};

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // This is crucial for redirecting users to a new password page
    });

    if (resetError) {
      setError(resetError.message);
      console.error('Password reset error:', resetError.message);
    } else {
      setMessage('If an account with that email exists, a password reset link has been sent to your email address.');
      setEmail(''); // Clear the email field
    }
    setLoading(false);
  };

  return (
    <div className="landing-page-wrapper">
      <Header />
      <div className="landing-content-area">
        <div className="form-login-card"> {/* Reusing the card structure from your login page */}
          <div className="form-login__form button-group">
            <h2 style={{ textAlign: 'center' }}>Forgot Password</h2>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
              Enter your email address below and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleResetPassword} className="login-form-fields">
              <div className="field">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  className="field__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {message && (
                <div style={{ textAlign: 'center', color: 'green', marginTop: '10px' }}>
                  {message}
                </div>
              )}
              {error && (
                <div style={{ textAlign: 'center', color: 'red', marginTop: '10px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="form-login__button button button--yellow" // Reusing your button styling
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="field" style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/customer-login" className="link">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;