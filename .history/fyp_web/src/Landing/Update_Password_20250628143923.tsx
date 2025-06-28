import { useState } from 'react';
import supabase from '../supabaseClient.js'; // Ensure this file exists in shared/
import '../shared/normalize.css'; // Ensure this file exists in shared/
import './Login.css'; // Reusing Login.css for consistent styling

function Update_Password() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm new password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    try {
      // In a real application, you would first verify the current password.
      // Supabase's `updateUser` function typically updates the password
      // for the currently authenticated user without needing the old password
      // if the session is active. If you need to verify the old password
      // for security, you might implement a server-side function or
      // re-authenticate the user.
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(`Error updating password: ${err.message}`);
    }
  };

  return (
    <div className="landing-page-wrapper">
      <div className="landing-content-area">
        <div className="form-login-card">
          <div className="form-login__inner">
            <h1 className="welcome-title">Update Password</h1>
            <p className="form-login__subtitle">
              Please enter your current password and a new password.
            </p>

            <form className="form-login__form" onSubmit={handleUpdatePassword}>
              <div className="field">
                <div className="field__group">
                  <input
                    type="password"
                    id="current-password"
                    className="field__input"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <div className="field__group">
                  <input
                    type="password"
                    id="new-password"
                    className="field__input"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
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
                  />
                </div>
              </div>

              {message && <p style={{ color: 'green' }}>{message}</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}

              <button type="submit" className="form-login__button button--yellow">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Update_Password;