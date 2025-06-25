// src/shared/Cust_Pass_Ver.tsx
import React, { useState } from 'react';

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
      <style jsx>{`
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
          background-color: var(--card-background, #ffffff); /* Use CSS variable or default white */
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
          width: 90%;
          max-width: 450px;
          text-align: center;
          color: var(--text, #333); /* Use CSS variable or default dark text */
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
          color: var(--heading-color, #2c3e50); /* Use CSS variable or default heading color */
        }

        .modal-description {
          font-size: 1rem;
          color: var(--text-color-light, #666); /* Use CSS variable or default light text */
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
          color: var(--text, #333);
        }

        .modal-input {
          width: calc(100% - 20px); /* Account for padding */
          padding: 0.8rem 1rem;
          border: 1px solid var(--border, #ddd); /* Use CSS variable or default border */
          border-radius: 8px;
          font-size: 1rem;
          background-color: var(--input-background-color, #f9f9f9); /* Use CSS variable or default light background */
          color: var(--input-text-color, #333);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .modal-input:focus {
          outline: none;
          border-color: var(--primary, #007bff); /* Use CSS variable or default accent */
          box-shadow: 0 0 0 3px var(--primary-light, rgba(0, 123, 255, 0.2)); /* For focus glow */
        }

        .modal-error {
          color: #e74c3c; /* Red color for errors */
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
          background-color: var(--primary, #007bff);
          color: var(--button-text-color, #ffffff);
        }

        .modal-button.primary:hover {
          background-color: var(--primary-dark, #0056b3);
          transform: translateY(-1px); /* Slight lift effect */
        }

        .modal-button.secondary {
          background-color: transparent;
          color: var(--primary, #007bff);
          border: 1px solid var(--primary, #007bff);
        }

        .modal-button.secondary:hover {
          background-color: var(--primary-light-transparent, rgba(108, 117, 125, 0.1));
          transform: translateY(-1px);
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
