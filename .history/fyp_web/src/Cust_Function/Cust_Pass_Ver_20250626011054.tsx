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
