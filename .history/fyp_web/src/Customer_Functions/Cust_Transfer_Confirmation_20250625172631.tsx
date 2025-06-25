"use client"

import type React from "react"
import { useState, useEffect } from "react" // Import useEffect
import { useNavigate, useLocation } from "react-router-dom"
import supabase from "../supabaseClient"
import { ArrowLeft } from "lucide-react"
import DarkModeToggle from "../shared/DarkModeToggle.tsx"
import Cust_Pass_Ver from '../Cust_Pass_Ver.tsx'; // Import the password verification modal

// IMPORT THE SHARED CSS FILES FOR CONSISTENCY
import '../shared/Header.css';
import '../shared/normalize.css';
import './Cust_Function.css';

// Re-use the Header component for consistency
const Header = () => {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error.message)
    } else {
      navigate("/customer-landing")
    }
  }

  const handleBack = () => {
    navigate("/customer-dashboard") // Changed to navigate to dashboard
  }

  return (
    <header className="header">
      <div className="header__content">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={24} />
          <span className="back-button-text">Back</span>
        </button>

        <div className="logo-section">
          <h1 className="logo-text">Eminent Western</h1>
        </div>
        <nav className="header-nav"></nav>
        <div className="header-actions">
          <DarkModeToggle />
          <button onClick={handleSignOut} className="sign-out-button header-sign-out-btn">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}

// Interface for account data, matching Supabase schema
interface AccountDetails {
  account_id: string
  account_no: string
  account_type: string
  balance: number
  nickname?: string
}

// Define an interface for the state passed to this page
interface TransferConfirmationState {
  initiatorAccountId: string
  receiverAccountNo: string
  receiverAccountId: string // Needed for updating recipient balance by ID
  amount: number
  purpose: string
  typeOfTransfer: string // Added this field
  initiatorAccountDetails: AccountDetails
  recipientAccountDetails: AccountDetails
}

export default function Cust_Tran_Confirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location

  // Destructure with default values to prevent undefined errors
  const {
    initiatorAccountId,
    receiverAccountNo,
    receiverAccountId,
    amount,
    purpose,
    typeOfTransfer,
    initiatorAccountDetails,
    recipientAccountDetails,
  } = (state || {}) as TransferConfirmationState;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // State for modal visibility
  const [userEmail, setUserEmail] = useState<string | null>(null); // State to store user email

  // Fetch user email when component mounts
  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        setError("Failed to get user information for verification.");
      } else if (data?.user) {
        setUserEmail(data.user.email);
      } else {
        setError("User email not found. Please log in again.");
      }
    };
    fetchUserEmail();
  }, []); // Run once on component mount

  // Redirect if critical state is missing (e.g., direct navigation to confirmation)
  if (!initiatorAccountId || !receiverAccountNo || !amount || !purpose || !typeOfTransfer || !initiatorAccountDetails || !recipientAccountDetails) {
    console.warn("Missing transfer details. Redirecting to transfer initiation.")
    navigate("/customer-transfer") // Redirect back to the transfer form
    return null
  }

  // This function will now be called AFTER successful password verification
  const handleConfirmTransformation = async () => {
    setProcessing(true)
    setError(null)
    setShowPasswordModal(false); // Close the password verification modal

    try {
      // --- Step 1: Re-fetch current balances to prevent race conditions ---
      const { data: currentInitiatorAccount, error: initiatorFetchError } = await supabase
        .from('Account')
        .select('balance')
        .eq('account_id', initiatorAccountId)
        .single();

      if (initiatorFetchError || !currentInitiatorAccount) {
        throw new Error(`Failed to fetch current initiator balance: ${initiatorFetchError?.message}`);
      }

      // Check for sufficient balance again with the *latest* balance
      if (currentInitiatorAccount.balance < amount) {
        throw new Error("Insufficient balance. Please check your account balance and try again.");
      }

      // --- Step 2: Debit initiator account ---
      const newInitiatorBalance = currentInitiatorAccount.balance - amount;
      const { error: debitError } = await supabase
        .from('Account')
        .update({ balance: newInitiatorBalance })
        .eq('account_id', initiatorAccountId);

      if (debitError) {
        throw new Error(`Failed to debit initiator account: ${debitError.message}`);
      }
      console.log(`Debited ${amount} from ${initiatorAccountDetails.account_no}`);

      // --- Step 3: Credit recipient account ---
      // Fetch recipient's current balance to calculate new balance
      const { data: currentRecipientAccount, error: recipientFetchError } = await supabase
        .from('Account')
        .select('balance')
        .eq('account_id', receiverAccountId) // Use account_id for update
        .single();

      if (recipientFetchError || !currentRecipientAccount) {
        throw new Error(`Failed to fetch current recipient balance: ${recipientFetchError?.message}`);
      }

      const newRecipientBalance = currentRecipientAccount.balance + amount;
      const { error: creditError } = await supabase
        .from('Account')
        .update({ balance: newRecipientBalance })
        .eq('account_id', receiverAccountId); // Use account_id for update

      if (creditError) {
        throw new Error(`Failed to credit recipient account: ${creditError.message}. Initiator account was debited.`);
      }
      console.log(`Credited ${amount} to ${receiverAccountNo}`);

      // --- Step 4: Insert transaction record into "Transaction" table ---
      const { error: transactionInsertError } = await supabase
        .from('Transaction')
        .insert({
          initiator_account_id: initiatorAccountId,
          receiver_account_no: receiverAccountNo,
          amount: amount,
          purpose: purpose,
          type_of_transfer: typeOfTransfer,
          // transfer_datetime automatically defaults to now() in Supabase
        });

      if (transactionInsertError) {
        throw new Error(`Failed to log transaction: ${transactionInsertError.message}`);
      }
      console.log("Transaction logged successfully.");

      // If all operations succeed
      navigate("/transfer-complete", { state: { status: "success", typeOfTransfer } })

    } catch (err: any) {
      console.error("Transaction Error:", err.message);
      // Pass the error message to the completion page to display it
      navigate("/transfer-complete", { state: { status: "failure", message: err.message, typeOfTransfer } });
    } finally {
      setProcessing(false)
    }
  }

  // This function will open the password verification modal
  const handleInitiateVerification = () => {
    if (!userEmail) {
      setError("User email not available for verification. Please refresh or log in again.");
      return;
    }
    setShowPasswordModal(true);
  };

  const handleCancel = () => {
    navigate("/customer-dashboard") // Changed to navigate to dashboard
  }

  // Helper function to format account number for display
  const formatAccountNo = (accountNo: string) => {
    if (!accountNo) return "";
    return `****${accountNo.slice(-4)}`;
  }

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-main">
        <div className="container">
          <div className="transactions-card">
            <div className="transactions-content">
              <div className="transactions-header">
                <h2 className="transactions-title">Confirm Your Transfer</h2>
              </div>
              {error && <p className="error-message-box">{error}</p>}
              <div className="confirmation-details">
                <p>
                  <strong>Transferring From:</strong> {initiatorAccountDetails.nickname ? `${initiatorAccountDetails.nickname} (` : ""}
                  {formatAccountNo(initiatorAccountDetails.account_no)} - {initiatorAccountDetails.account_type}
                  {initiatorAccountDetails.nickname ? `)` : ""} (Current Balance: ${initiatorAccountDetails.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                </p>
                <p>
                  <strong>Transferring To:</strong> {recipientAccountDetails.nickname ? `${recipientAccountDetails.nickname} (` : ""}
                  {formatAccountNo(recipientAccountDetails.account_no)} - {recipientAccountDetails.account_type}
                  {recipientAccountDetails.nickname ? `)` : ""}
                </p>
                <p>
                  <strong>Amount:</strong> ${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <p>
                  <strong>Type of Transfer:</strong> {typeOfTransfer}
                </p>
                <p>
                  <strong>Purpose:</strong> {purpose}
                </p>

                <p className="warning-text">
                  Please review these details carefully. This action cannot be undone.
                </p>
              </div>
              <div className="button-group">
                <button
                  onClick={handleInitiateVerification} // This now opens the password modal
                  className="primary-button"
                  disabled={processing || !userEmail} // Disable if already processing or no email
                >
                  {processing ? "Processing..." : "Confirm Transfer"}
                </button>
                <button
                  onClick={handleCancel}
                  className="secondary-button"
                  disabled={processing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Verification Modal */}
      <Cust_Pass_Ver
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handleConfirmTransformation} // Call the actual transfer logic on success
        userEmail={userEmail || ''} // Pass the fetched user email
      />
    </div>
  )
}