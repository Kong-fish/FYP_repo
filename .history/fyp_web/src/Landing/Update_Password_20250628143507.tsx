import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// NOTE: In a real application, you would initialize your Supabase client
// from '@supabase/supabase-js' with your actual project URL and anon key.
// For this self-contained Canvas example, we are using a mock Supabase client
// to prevent compilation errors related to unresolved external modules.
const supabase = {
  auth: {
    /**
     * Mocks the Supabase `updateUser` method for demonstration purposes in Canvas.
     * In a real application, this would connect to your Supabase backend.
     * @param {Object} options - An object containing the password to update.
     * @returns {Promise<Object>} - A promise that resolves with an error (if any) or null.
     */
    updateUser: async ({ password }: { password?: string }) => {
      return new Promise((resolve) => {
        // Simulate a network delay
        setTimeout(() => {
          // Simulate an error for demonstration (e.g., if password is 'fail')
          if (password === 'fail') {
            resolve({ error: { message: 'Simulated password update failed due to internal error.' } });
          } else {
            // Simulate a successful update
            resolve({ error: null, data: { user: { id: 'mock-user-id', email: 'user@example.com' } } });
          }
        }, 1000); // 1-second delay
      });
    },
  },
};

const UpdatePassword: React.FC = () => {
  // State variables for new password, confirmation, loading status, and messages
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // useEffect to clear messages after a short delay
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000); // Clear messages after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  /**
   * Handles the password update form submission.
   * @param e The form event.
   */
  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);   // Set loading state to true
    setMessage(null);   // Clear previous messages
    setError(null);     // Clear previous errors

    // Check if the new password and confirm password fields match
    if (password !== confirmPassword) {
      setError('Passwords do not match.'); // Set an error message
      setLoading(false);                   // End loading
      return;                              // Stop the function execution
    }

    // Call Supabase (or mock Supabase) to update the user's password
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      // If there's an error during the update
      setError(updateError.message); // Set the error message from Supabase mock
      console.error('Password update error:', updateError.message); // Log the error for debugging
    } else {
      // If the password update is successful
      setMessage('Your password has been updated successfully!'); // Set a success message
      setPassword('');                                         // Clear password input
      setConfirmPassword('');                                  // Clear confirm password input
    }
    setLoading(false); // Set loading state to false
  };

  return (
    <>
      {/* Embedded CSS for styling. This is done to make the component self-contained in Canvas. */}
      {/* In a real project, these would typically be external CSS files. */}
      <style>
        {`
          :root {
            --font-inter: 'Inter', sans-serif;
            --color-yellow-500: #f4cd62;
            --color-yellow-600: #f6ad55;
          }

          .landing-page-wrapper {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            font-family: var(--font-inter, sans-serif);
          }

          .landing-content-area {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 10px;
          }
          .form-login {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .form-login-card {
            background-color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            width: 100%;
            max-width: 28rem;
            text-align: center;
            transition-property: background-color, color;
            transition-duration: 300ms;
          }

          html.dark .form-login-card {
            background-color: #2d3748;
          }

          .form-login__inner {
            width: 100%;
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .form-login__logo {
            height: 120px;
            margin-bottom: 10px;
            animation: logo-fade-in 2s ease-out forwards;
            opacity: 0;
          }

          .welcome-title {
            font-size: 2.25rem;
            font-weight: 800;
            margin-bottom: 2rem;
            color: #1a202c;
          }

          html.dark .welcome-title {
            color: #fff;
          }

          .form-login__title {
            font-size: 20px;
            font-weight: 300;
            text-align: center;
            margin-bottom: 30px;
          }

          .form-login__subtitle {
            margin-bottom: 30px;
            font-size: 16px;
          }

          .form-login__form {
            opacity: 0;
            transform: translateY(20px);
            animation: fade-up 0.5s ease-out forwards;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }

          .field:not(:last-child) {
            margin-bottom: 16px;
          }

          .field__group {
            position: relative;
          }

          .field__input {
            background-color: #fff;
            border: 2px solid #c6cbda;
            border-radius: 8px;
            color: #8a93a7;
            font-size: 16px;
            font-weight: 400;
            line-height: 19px;
            outline: none;
            padding: 12px 16px;
            height: 50px;
            margin-top: 0 !important;
            width: 100%; /* Ensure input takes full width of its container */
          }

          .button {
            border-radius: 24px;
            display: block;
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 0.2px;
            line-height: 1.5;
            outline: none;
            padding: 12px 64px;
            text-align: center;
            text-transform: uppercase;
            cursor: pointer;
            border: none !important;
            transition: background-color 0.3s ease;
            text-decoration: none;
          }

          .button--yellow {
            background-color: #fdcb04;
            color: #385A93;
          }

          .button--yellow:hover {
            background-color: #e0b300;
          }

          .form-login__button.button--yellow {
            width: 100%;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
            border-radius: 0.5rem;
            font-size: 1.125rem;
            font-weight: 600;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition-property: all;
            transition-duration: 300ms;
            background-color: var(--color-yellow-500);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            text-decoration: none;
            white-space: normal;
            word-wrap: break-word;
          }

          .form-login__button.button--yellow:hover {
            background-color: var(--color-yellow-600);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }

          @keyframes fade-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes logo-fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @media screen and (max-width: 768px) {
            .form-login__logo {
              height: 100px;
              margin-bottom: 10px;
            }
            .form-login__title {
              font-size: 20px;
              font-weight: 400;
            }
            .form-login__subtitle {
              margin-top: 18px;
              margin-bottom: 20px;
              font-size: 16px;
            }
            .field__input {
              border: 1px solid #c6cbda;
              border-radius: 4px;
              font-size: 14px;
              height: 40px;
              /* Removed fixed width, replaced by 100% in general rule */
            }
            .form-login-card {
              padding: 1.5rem;
            }
            .welcome-title {
              font-size: 1.75rem;
              margin-bottom: 1.5rem;
            }
          }

          @media screen and (max-width: 480px) {
            .form-login__logo {
              height: 80px;
              margin-bottom: 8px;
            }
            .form-login__title {
              font-size: 18px;
              font-weight: 400;
            }
            .form-login__subtitle {
              margin-top: 10px;
              margin-bottom: 15px;
              font-size: 14px;
            }
            .field__input {
              height: 55px;
              width: 100%;
            }
            .form-login-card {
              padding: 1rem;
            }
            .welcome-title {
              font-size: 1.5rem;
              margin-bottom: 1rem;
            }
            .form-login__button.button--yellow {
              font-size: 1rem;
              padding-top: 0.6rem;
              padding-bottom: 0.6rem;
            }
          }

          html.dark .imageContainer {
            background-color: #dacecd !important;
          }

          .forgot-password-link {
            color: #0000FF;
          }
        `}
      </style>

      <div className="landing-page-wrapper">
        <div className="landing-content-area">
          <div className="form-login-card"> {/* Reusing the card structure */}
            <div className="form-login__form button-group">
              <h2 style={{ textAlign: 'center' }}>Update Password</h2>
              <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                Please enter your new password below.
              </p>

              <form onSubmit={handlePasswordUpdate} className="login-form-fields">
                <div className="field">
                  <input
                    type="password"
                    placeholder="New Password"
                    name="password"
                    className="field__input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password" // Suggests to browser it's a new password
                  />
                </div>

                <div className="field">
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    name="confirmPassword"
                    className="field__input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password" // Suggests to browser it's a new password
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
                  className="form-login__button button button--yellow"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              <div className="field" style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/customer-login" className="link">Back to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdatePassword;
