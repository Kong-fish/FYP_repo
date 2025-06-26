import React, { useState } from 'react';
// Original Supabase client import - kept as per your request
import supabase from '../supabaseClient.js';

interface AdminPassVerProps {
    isOpen: boolean; // Controls whether the modal is visible
    onClose: () => void; // Function to call when the modal should be closed
    onVerify: (password: string) => void; // Function called with the entered password on verification attempt
    title?: string; // Optional title for the modal
    description?: string; // Optional description for the modal
    verificationError?: string | null; // Optional error message to display from parent component
}

const Admin_Pass_Ver: React.FC<AdminPassVerProps> = ({
    isOpen,
    onClose,
    onVerify,
    title = 'Admin Identity Verification',
    description = 'Please enter your admin password to proceed.',
    verificationError,
}) => {
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null); // For local validation

    if (!isOpen) {
        return null; // Don't render anything if not open
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null); // Clear previous local errors

        if (!password) {
            setLocalError('Password cannot be empty.');
            return;
        }

        // Pass the password to the parent's onVerify function
        onVerify(password);
        // Password field is cleared by the parent's onClose or successful navigation
    };

    const handleClose = () => {
        setPassword(''); // Clear password on close
        setLocalError(null); // Clear local error on close
        onClose(); // Call parent's close handler
    };

    return (
        <>
            <style>{`
                /* Admin_Pass_Ver Modal Styles (Self-Contained) */

                /* Light Mode Variables (directly defined for self-containment) */
                :root {
                    --modal-bg-light: #ffffff;
                    --modal-text-primary-light: #333;
                    --modal-text-secondary-light: #6b7280;
                    --modal-border-light: #e0e0e0;
                    --modal-primary-color-light: #4f46e5; /* Indigo-600 */
                    --modal-primary-hover-light: #4338ca; /* Indigo-700 */
                    --modal-error-color-light: #991b1b; /* Red-800 */
                }

                /* Dark Mode Variables (directly defined for self-containment) */
                body.dark-mode {
                    --modal-bg-dark: #2d3748;
                    --modal-text-primary-dark: #e2e8f0;
                    --modal-text-secondary-dark: #9ca3af;
                    --modal-border-dark: #4a5568;
                    --modal-primary-color-dark: #6366f1; /* Indigo-500 */
                    --modal-primary-hover-dark: #4f46e5; /* Indigo-600 */
                    --modal-error-color-dark: #ef4444; /* Red-500 */
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent black background */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000; /* Ensure it's on top of other content */
                }

                .modal-content {
                    background-color: var(--modal-bg-light);
                    padding: 2.5rem;
                    border-radius: 12px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
                    width: 90%;
                    max-width: 450px;
                    text-align: center;
                    color: var(--modal-text-primary-light);
                    position: relative;
                    animation: fadeInScale 0.3s ease-out forwards;
                }

                body.dark-mode .modal-content {
                    background-color: var(--modal-bg-dark);
                    color: var(--modal-text-primary-dark);
                }

                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .modal-title {
                    font-size: 1.8rem;
                    margin-bottom: 1rem;
                    color: var(--modal-text-primary-light);
                }

                body.dark-mode .modal-title {
                    color: var(--modal-text-primary-dark);
                }

                .modal-description {
                    font-size: 1rem;
                    color: var(--modal-text-secondary-light);
                    margin-bottom: 1.5rem;
                }

                body.dark-mode .modal-description {
                    color: var(--modal-text-secondary-dark);
                }

                .form-group {
                    margin-bottom: 1.5rem;
                    text-align: left;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.6rem;
                    font-weight: 600;
                    color: var(--modal-text-primary-light);
                }

                body.dark-mode .form-group label {
                    color: var(--modal-text-primary-dark);
                }

                .modal-input {
                    width: calc(100% - 20px); /* Account for padding */
                    padding: 0.8rem 1rem;
                    border: 1px solid var(--modal-border-light);
                    border-radius: 8px;
                    font-size: 1rem;
                    background-color: var(--modal-bg-light); /* Input background matching modal background */
                    color: var(--modal-text-primary-light);
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                body.dark-mode .modal-input {
                    background-color: var(--modal-bg-dark);
                    color: var(--modal-text-primary-dark);
                    border-color: var(--modal-border-dark);
                }

                .modal-input:focus {
                    outline: none;
                    border-color: var(--modal-primary-color-light);
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2); /* Static blue shadow for focus */
                }

                body.dark-mode .modal-input:focus {
                    border-color: var(--modal-primary-color-dark);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                }

                .modal-error {
                    color: var(--modal-error-color-light);
                    margin-top: -0.8rem;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    text-align: center;
                }

                body.dark-mode .modal-error {
                    color: var(--modal-error-color-dark);
                }

                .modal-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .modal-button {
                    padding: 0.8rem 1.8rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.05rem;
                    cursor: pointer;
                    transition: background-color 0.2s ease, transform 0.1s ease;
                    font-weight: 600;
                }

                .modal-button.primary {
                    background-color: var(--modal-primary-color-light);
                    color: white;
                }

                body.dark-mode .modal-button.primary {
                    background-color: var(--modal-primary-color-dark);
                }

                .modal-button.primary:hover {
                    background-color: var(--modal-primary-hover-light);
                    transform: translateY(-1px);
                }

                body.dark-mode .modal-button.primary:hover {
                    background-color: var(--modal-primary-hover-dark);
                }

                .modal-button.secondary {
                    background-color: transparent;
                    color: var(--modal-primary-color-light);
                    border: 1px solid var(--modal-primary-color-light);
                }

                body.dark-mode .modal-button.secondary {
                    color: var(--modal-primary-color-dark);
                    border: 1px solid var(--modal-primary-color-dark);
                }

                .modal-button.secondary:hover {
                    background-color: rgba(79, 70, 229, 0.1); /* Light mode hover */
                    transform: translateY(-1px);
                }

                body.dark-mode .modal-button.secondary:hover {
                    background-color: rgba(99, 102, 241, 0.1); /* Dark mode hover */
                }

                /* Responsive adjustments for modal */
                @media (max-width: 600px) {
                    .modal-content {
                        padding: 1.5rem;
                    }
                    .modal-title {
                        font-size: 1.5rem;
                    }
                    .modal-description {
                        font-size: 0.9rem;
                    }
                    .modal-button {
                        padding: 0.7rem 1.2rem;
                        font-size: 0.95rem;
                    }
                }
            `}</style>
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2 className="modal-title">{title}</h2>
                    <p className="modal-description">{description}</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="modal-input"
                                required
                                autoFocus // Automatically focus the input when modal opens
                            />
                        </div>
                        {/* Display local validation errors or errors from the parent */}
                        {(localError || verificationError) && <p className="modal-error">{localError || verificationError}</p>}
                        <div className="modal-actions">
                            <button type="submit" className="modal-button primary">Verify</button>
                            <button type="button" onClick={handleClose} className="modal-button secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Admin_Pass_Ver;
