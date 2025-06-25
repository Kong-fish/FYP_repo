import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Changed useParams to useLocation
import { ArrowLeft, Wallet, Calendar, DollarSign, Info } from "lucide-react";
import supabase from '../supbaseClient.js';
import '../shared/Header.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

// Header Component (copied for self-containment, but ideally imported)
const Header = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/landing');
    }
  };

  const handleBack = () => {
    // Navigate back to the admin dashboard
    navigate("/admin-dashboard");
  };

  return (
    <header className="header">
      <div className="header__content">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={24} />
          <span className="back-button-text">Back</span>
        </button>
        <h1 className="header__title">Eminent Western</h1>
        <nav className="header-nav">
        </nav>
        <div className="header-actions">
          <DarkModeToggle />
          <button onClick={handleSignOut} className="sign-out-button">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

// Interface for Transfer details
interface Transfer {
  transaction_id: string;
  initiator_account_no: string;
  receiver_account_no: string;
  amount: number;
  transfer_datetime: string;
  type_of_transfer: string;
  purpose: string; // Added purpose as it's typically part of a transaction
}

export default function AdminTransferDetail() {
  const location = useLocation(); // Use useLocation to access state
  const navigate = useNavigate();
  // Ensure the ID passed from location.state is correctly named to match 'transaction_id'
  const transactionId = (location.state as { transaction_id?: string })?.transaction_id; // Get transaction_id from location.state

  const [transferDetails, setTransferDetails] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to determine badge class (re-used from dashboard)
  const getStatusClass = (status: string | boolean | null) => {
    if (typeof status === "boolean") {
      return status ? "badge-success" : "badge-error";
    }
    switch (status?.toLowerCase()) {
      case "active":
      case "completed":
      case "approved":
        return "badge-success";
      case "pending":
      case "under review":
      case "null":
        return "badge-warning";
      case "inactive":
      case "rejected":
      case "failed":
        return "badge-error";
      default:
        return "badge-default";
    }
  };

  useEffect(() => {
    const fetchTransferDetails = async () => {
      // Use transactionId for the check
      if (!transactionId) {
        setError("No transfer ID provided. Please navigate to this page from the dashboard with a specific transfer selected.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("Transaction")
          .select(
            `
            transaction_id,
            amount,
            purpose,
            type_of_transfer,
            transfer_datetime,
            receiver_account_no,
            Account!Transaction_initiator_account_id_fkey(account_no)
            `
          )
          // Use transactionId in the query
          .eq("transaction_id", transactionId)
          .single(); // Use .single() to expect one row

        if (fetchError) {
          console.error("Error fetching transfer details:", fetchError);
          setError(`Failed to load transfer details: ${fetchError.message}`);
          setTransferDetails(null);
        } else if (data) {
          // Format the fetched data to match the Transfer interface
          const formattedData: Transfer = {
            transaction_id: data.transaction_id,
            initiator_account_no: data.Account?.account_no || "N/A",
            receiver_account_no: data.receiver_account_no || "N/A",
            amount: data.amount,
            transfer_datetime: new Date(data.transfer_datetime).toLocaleString(),
            type_of_transfer: data.type_of_transfer,
            purpose: data.purpose || "N/A", // Default if purpose is null
          };
          setTransferDetails(formattedData);
        } else {
          setError("Transfer not found.");
          setTransferDetails(null);
        }
      } catch (err) {
        console.error("An unexpected error occurred:", err);
        setError("An unexpected error occurred while fetching details.");
        setTransferDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTransferDetails();
  }, [transactionId]); // Re-run when transactionId changes

  return (
    <div className="admin-container">
      <Header />

      <main className="main-content">
        <header className="admin-header">
          <div className="header-content">
            <h1 className="brand-title">Transfer Details</h1>
          </div>
        </header>

        <div className="detail-card-container">
          {loading && <p className="loading-message">Loading transfer details...</p>}
          {error && <p className="error-message">{error}</p>}
          {transferDetails && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Transfer ID: {transferDetails.transaction_id.substring(0, 8)}...</h3>
                <p className="card-description">Detailed information about this transaction.</p>
              </div>
              <div className="card-content detail-grid">
                <div className="detail-item">
                  <span className="detail-label">
                    <Wallet size={16} /> From Account:
                  </span>
                  <span className="detail-value">{transferDetails.initiator_account_no}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <Wallet size={16} /> To Account:
                  </span>
                  <span className="detail-value">{transferDetails.receiver_account_no}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <DollarSign size={16} /> Amount:
                  </span>
                  <span className="detail-value">${transferDetails.amount?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <Info size={16} /> Type of Transfer:
                  </span>
                  <span className={`detail-value badge ${getStatusClass(transferDetails.type_of_transfer)}`}>
                    {transferDetails.type_of_transfer}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <Calendar size={16} /> Date & Time:
                  </span>
                  <span className="detail-value">{transferDetails.transfer_datetime}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">
                    <Info size={16} /> Purpose:
                  </span>
                  <span className="detail-value">{transferDetails.purpose}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
