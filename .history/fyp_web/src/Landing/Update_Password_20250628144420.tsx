import { useState } from 'react';
import supabase from '../supabaseClient.js'; // Ensure this file exists in shared/
import '../shared/normalize.css'; // Ensure this file exists in shared/
import './Login.css'; // Reusing Login.css for consistent styling

function ForgotPasswordRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`, // IMPORTANT: This URL must match the path where your ResetPasswordConfirm.tsx component is rendered.
      });

      if (error) {
        throw error;
      }

      setMessage('Password reset email sent! Check your inbox (and spam folder).');
      setEmail('');
    } catch (err: any) {
      setError(`Error requesting password reset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page-wrapper">
      <div className="landing-content-area">
        <div className="form-login-card">
          <div className="form-login__inner">
            <h1 className="welcome-title">Forgot Password?</h1>
            <p className="form-login__subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form className="form-login__form" onSubmit={handleRequestReset}>
              <div className="field">
                <div className="field__group">
                  <input
                    type="email"
                    id="email"
                    className="field__input"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
              {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

              <button
                type="submit"
                className="form-login__button button--yellow"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="form-login__subtitle" style={{ marginTop: '1rem' }}>
              Remembered your password?{' '}
              <a href="/login" className="forgot-password-link">
                Login here
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordRequest;