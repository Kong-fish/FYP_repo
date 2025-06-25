import React, { useState } from 'react';

// AdminPasswordVerificationModal Component
// This component provides a modal for admin password verification.
// It includes input for a password and buttons for submission or cancellation.
const AdminPasswordVerificationModal = ({ onVerify, onClose }: { onVerify: (password: string) => void; onClose: () => void }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Handles changes to the password input field
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError(''); // Clear error when user starts typing again
    };

    // Handles the submission of the password for verification
    const handleSubmit = () => {
        // In a real application, you would send this password to a secure backend
        // for verification. For this mock, we'll use a simple hardcoded check.
        if (password === 'admin123') { // Mock password
            onVerify(password);
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    // Handles key presses, specifically for the 'Enter' key to submit
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full transform transition-all duration-300 scale-100 opacity-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Admin Verification</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Please enter the administrator password to proceed.
                </p>
                <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyPress={handleKeyPress}
                />
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Verify
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPasswordVerificationModal;
