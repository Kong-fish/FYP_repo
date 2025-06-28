import { useState, useEffect } from 'react';
import supabase from '../supabaseClient.js'; // Ensure this file exists in shared/
import '../shared/normalize.css'; // Ensure this file exists in shared/
import './Login.css'; // Reusing Login.css for consistent styling
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router-dom for navigation

function ResetPasswordConfirm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false); // To ensure session is ready
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase client automatically picks up the access_token from the URL
    // and sets the session. We just need to wait for it.
    const checkSession = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setError('Invalid or expired password reset link. Please request a new one.');
        // Optionally redirect to the forgot password request page
        // Adding a slight delay for the user to read the message
        setTimeout(() => navigate('/forgot-password'), 3000); // Adjust to your ForgotPasswordRequest path
      } else {
        setSessionVerified(true);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth state changes, especially important for recovery links
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // If a session is established (e.g., from recovery token), verify it
          setSessionVerified(true);
          setMessage(''); // Clear any previous error if session is now valid
        } else if (event === 'SIGNED_OUT') {
          // If for some reason signed out after recovery, prompt for new link
          setError('Session terminated. Please request a new password reset link.');
          setSessionVerified(false);
          setTimeout(() => navigate('/forgot-password'), 3000);
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm new password do not match.');
      setLoading(false);
      return;
    }

    if (!sessionVerified) {
      setError('Session not verified. Please wait or refresh the page if this persists.');
      setLoading(false);
      return;
    }

    try {
      // Use updateUser with the new password. This works because the recovery token
      // has already established a temporary session for this user.
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setMessage('Your password has been successfully reset! Redirecting to login...');
      setNewPassword('');
      setConfirmNewPassword('');

      // *** THIS IS THE LINE THAT REDIRECTS TO /LOGIN AFTER SUCCESS ***
      setTimeout(() => {
        navigate('/login'); // Adjust '/login' to your actual login path if different
      }, 3000); // Wait 3 seconds before redirecting

    } catch (err: any) {
      setError(`Error resetting password: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !sessionVerified) {
    return (
      <div className="landing-page-wrapper">
        <div className="landing-content-area">
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page-wrapper">
      <div className="landing-content-area">
        <div className="form-login-card">
          <div className="form-login__inner">
            <h1 className="welcome-title">Set New Password</h1>
            <p className="form-login__subtitle">
              Please enter your new password below.
            </p>

            <form className="form-login__form" onSubmit={handleResetPassword}>
              <div className="field">
                <div className="field__group">
                  <input
                    type="password"
                    id="new-password"
                    className="field__input"
                    placeholder="New Password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading || !sessionVerified}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="field">
                <div className="field__group">
                  <input
                    type="password"
                    id="confirm-new-password"
                    className="field__input"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={loading || !sessionVerified}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
              {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

              <button
                type="submit"
                className="form-login__button button--yellow"
                disabled={loading || !sessionVerified}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordConfirm;