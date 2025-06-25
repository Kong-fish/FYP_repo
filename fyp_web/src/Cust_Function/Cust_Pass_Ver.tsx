// src/Cust_Function/Cust_Pass_Ver.tsx
import React, { useState } from 'react';
import supabase from '../supbaseClient.js';

interface CustPassVerProps {
    isOpen: boolean; // Controls whether the modal is visible
    onClose: () => void; // Function to call when the modal should be closed
    onVerify: (password: string) => void; // Function called with the entered password on verification attempt
    title?: string; // Optional title for the modal
    description?: string; // Optional description for the modal
    verificationError?: string | null; // Optional error message to display from parent component
}

const Cust_Pass_Ver: React.FC<CustPassVerProps> = ({
    isOpen,
    onClose,
    onVerify,
    title = 'Verify Your Identity',
    description = 'Please enter your password to proceed.',
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
                /* Styles for Cust_Pass_Ver Modal - MERGED */
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
                    /* Using CSS variables from dashboard for consistent theming */
                    background-color: var(--bg-secondary); /* Uses the themed background for cards */
                    padding: 2.5rem;
                    border-radius: 12px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
                    width: 90%;
                    max-width: 450px;
                    text-align: center;
                    color: var(--text-primary); /* Uses the themed primary text color */
                    position: relative;
                    animation: fadeInScale 0.3s ease-out forwards;
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
                    color: var(--text-primary); /* Uses the themed primary text color */
                }

                .modal-description {
                    font-size: 1rem;
                    color: var(--text-secondary); /* Uses the themed secondary text color */
                    margin-bottom: 1.5rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                    text-align: left;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.6rem;
                    font-weight: 600;
                    color: var(--text-primary); /* Uses the themed primary text color */
                }

                .modal-input {
                    width: calc(100% - 20px); /* Account for padding */
                    padding: 0.8rem 1rem;
                    border: 1px solid var(--card-border); /* Uses the themed border color */
                    border-radius: 8px;
                    font-size: 1rem;
                    background-color: var(--bg-primary); /* Uses the themed primary background for inputs */
                    color: var(--text-primary); /* Uses the themed primary text color */
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .modal-input:focus {
                    outline: none;
                    border-color: var(--blue-accent); /* Uses the themed accent color */
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2); /* Static, but can be made variable if needed */
                }

                .modal-error {
                    color: var(--red-debit); /* Uses the themed red color for errors */
                    margin-top: -0.8rem; /* Adjust spacing */
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .modal-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem; /* Space between buttons */
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
                    background-color: var(--blue-accent); /* Uses the themed accent color */
                    color: white; /* Button text always white for contrast */
                }

                .modal-button.primary:hover {
                    background-color: var(--blue-accent-hover); /* Uses the themed hover color */
                    transform: translateY(-1px); /* Slight lift effect */
                }

                .modal-button.secondary {
                    background-color: transparent;
                    color: var(--blue-accent); /* Uses the themed accent color for text */
                    border: 1px solid var(--blue-accent); /* Uses the themed accent color for border */
                }

                .modal-button.secondary:hover {
                    background-color: rgba(0, 123, 255, 0.1); /* Static, but can be made variable if needed */
                    transform: translateY(-1px);
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

export default Cust_Pass_Ver;
