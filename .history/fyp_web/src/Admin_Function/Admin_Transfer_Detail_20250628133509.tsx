import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import '../shared/normalize.css'; // Assuming you have a normalize.css
import './AdminFunction.css'; // Your CSS for admin functions
import { ArrowLeft, Send, Clock, User, DollarSign } from 'lucide-react'; // Example icons

// Define an interface for the transfer details
interface TransferDetails {
    transaction_id: string;
    initiator_account_id: string;
    receiver_account_no: string;
    amount: number;
    purpose: string | null;
    type_of_transfer: string;
    transfer_datetime: string;
    // Potentially add more details from the joined Account table if needed
    initiator_account_no_display?: string; // To display the initiator's account number
}

export default function AdminTransferDetail() {
    // useParams hook to extract the dynamic segment from the URL
    const { transferId } = useParams<{ transferId: string }>();
    const navigate = useNavigate();

    const [transfer, setTransfer] = useState<TransferDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to format date/time consistently
    const formatDateTime = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    useEffect(() => {
        const fetchTransferDetails = async () => {
            setLoading(true);
            setError(null);

            // --- IMPORTANT: Check if transferId exists ---
            if (!transferId) {
                setError('No transfer ID provided. Please navigate to this page from the dashboard with a specific transfer selected.');
                setLoading(false);
                return; // Stop execution if no ID
            }

            try {
                // Fetch the transaction details and join with the Account table
                // to get the initiator's account number if not directly stored in Transaction table
                const { data, error: fetchError } = await supabase
                    .from('Transaction')
                    .select(`
                        transaction_id,
                        initiator_account_id,
                        receiver_account_no,
                        amount,
                        purpose,
                        type_of_transfer,
                        transfer_datetime,
                        Account!Transaction_initiator_account_id_fkey(account_no)
                    `)
                    .eq('transaction_id', transferId)
                    .single(); // Use .single() as we expect only one record

                if (fetchError || !data) {
                    throw new Error(`Failed to fetch transfer details: ${fetchError?.message || 'Transfer not found.'}`);
                }

                // Map the fetched data to your TransferDetails interface, handling nested Account data
                const formattedTransfer: TransferDetails = {
                    transaction_id: data.transaction_id,
                    initiator_account_id: data.initiator_account_id,
                    receiver_account_no: data.receiver_account_no,
                    amount: data.amount,
                    purpose: data.purpose,
                    type_of_transfer: data.type_of_transfer,
                    transfer_datetime: data.transfer_datetime,
                    // Access the joined initiator account number
                    initiator_account_no_display: Array.isArray(data.Account) && data.Account.length > 0 ? data.Account[0].account_no : 'N/A'
                };

                setTransfer(formattedTransfer);

            } catch (err: any) {
                console.error('Error fetching transfer details:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransferDetails();
    }, [transferId]); // Re-run effect if transferId changes

    if (loading) {
        return (
            <div className="admin-detail-wrapper"> {/* Ensured wrapper is always present for consistent loading/error styling */}
                <div className="admin-detail-container">
                    <p className="admin-loading-message">Loading transfer details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-detail-wrapper"> {/* Ensured wrapper is always present for consistent loading/error styling */}
                <div className="admin-detail-container">
                    <div className="admin-error-card">
                        <h2 className="admin-error-title">Error Loading Transfer</h2>
                        <p className="admin-error-message">{error}</p>
                        <button onClick={() => navigate('/admin-dashboard')} className="admin-error-button">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!transfer) {
        return (
            <div className="admin-detail-wrapper"> {/* Ensured wrapper is always present for consistent loading/error styling */}
                <div className="admin-detail-container">
                    <div className="admin-error-card">
                        <h2 className="admin-error-title">Transfer Not Found</h2>
                        <p className="admin-error-message">The requested transfer details could not be found.</p>
                        <button onClick={() => navigate('/admin-dashboard')} className="admin-error-button">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-detail-wrapper">
            <div className="admin-detail-container">
                <div className="admin-detail-header">
                    <button onClick={() => navigate(-1)} className="admin-back-button">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 className="admin-detail-title">Transfer Details</h1>
                </div>

                {/* Applying customer-details-section-wrapper for Transaction Information */}
                <div className="customer-details-section-wrapper mb-8"> {/* Added margin-bottom for spacing */}
                    <h2 className="admin-detail-section-title">
                        <Send size={24} /> Transaction Information
                    </h2>
                    <div className="admin-detail-grid">
                        <p className="admin-detail-item">
                            <strong className="admin-detail-label">Transaction ID:</strong> <span className="admin-detail-value">{transfer.transaction_id}</span>
                        </p>
                        <p className="admin-detail-item">
                            <strong className="admin-detail-label">Type of Transfer:</strong> <span className="admin-detail-value">{transfer.type_of_transfer}</span>
                        </p>
                        <p className="admin-detail-item">
                            <strong className="admin-detail-label">Amount:</strong> <span className="admin-detail-value">${transfer.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                        <p className="admin-detail-item">
                            <strong className="admin-detail-label">Purpose:</strong> <span className="admin-detail-value">{transfer.purpose || 'N/A'}</span>
                        </p>
                        <p className="admin-detail-item">
                            <strong className="admin-detail-label"><Clock size={16} className="admin-detail-icon-inline" /> Date & Time:</strong> <span className="admin-detail-value">{formatDateTime(transfer.transfer_datetime)}</span>
                        </p>
                    </div>
                </div>

                {/* Applying customer-details-section-wrapper for Account Information */}
                <div className="customer-details-section-wrapper">
                    <h2 className="admin-detail-section-title">
                        <User size={24} /> Account Information
                    </h2>
                    <div className="admin-detail-grid">
                        <p className="admin-detail-item">
                            <strong className="admin-detail-label">From Account:</strong> <span className="admin-detail-value">{transfer.initiator_account_no_display || 'N/A'}</span>
                        </p>
                        <p className="admin-detail-item">
                            <strong className="admin-detail-label">To Account:</strong> <span className="admin-detail-value">{transfer.receiver_account_no || 'N/A'}</span>
                        </p>
                        {/* You can add more account details here if needed */}
                    </div>
                </div>

                {/* Example action buttons - adapt as necessary */}
                <div className="admin-detail-actions">
                    <button className="admin-detail-action-button admin-detail-action-button-warning">
                        <DollarSign size={16} className="admin-detail-icon-inline" /> Flag Transfer
                    </button>
                    {/* More actions like 'Print Details', 'Investigate' etc. */}
                </div>
            </div>
        </div>
    );
}
