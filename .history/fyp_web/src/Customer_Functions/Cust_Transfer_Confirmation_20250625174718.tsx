"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import supabase from "../supabaseClient" // Adjust path as needed
import { ArrowLeft } from "lucide-react" // Import ArrowLeft icon for back button
import DarkModeToggle from "../shared/DarkModeToggle.tsx" // Adjust path as needed

// IMPORT THE SHARED CSS FILE
import "./Cust_Transfer.css" // Reusing Cust_Transfer.css for all styling

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
    navigate(-1) // Navigates back one step in the history
  }

  return (
    <header className="header">
      <div className="header__content">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={24} />
          <span className="back-button-text">Back</span>
        </button>

        <div className="logo-section">
          <span className="logo-icon">🏦</span>
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

// Define an interface for the state passed to this page
interface TransformationState {
  transformationType: string // e.g., "Account Type Change", "Profile Update"
  details: Record<string, any> // Generic object to hold transformation-specific details
  // You can add more specific fields here as needed
}

export default function Cust_Tran_Confirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location
  const transformationDetails = state as TransformationState

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if no state is present (e.g., direct navigation)
  if (!transformationDetails) {
    navigate("/customer-dashboard") // Or back to the page where transformation is initiated
    return null
  }

  const { transformationType, details } = transformationDetails

  const handleConfirmTransformation = async () => {
    setProcessing(true)
    setError(null)

    try {
      // ==========================================================
      // !!! IMPORTANT: REPLACE THIS PLACEHOLDER LOGIC !!!
      // This is where your actual Supabase database "transformation"
      // logic would go. Example: updating a user profile, changing
      // an account status, etc.
      //
      // Example placeholder:
      // const { data, error: dbError } = await supabase
      //     .from('YourTransformationTable') // Replace with your actual table
      //     .update({
      //         // Your update fields based on `details`
      //         status: 'completed',
      //         transformed_at: new Date().toISOString(),
      //         ...details // Merge details into the update
      //     })
      //     .eq('id', details.recordIdToUpdate); // Replace with your primary key
      //
      // If it's an insert:
      // const { data, error: dbError } = await supabase
      //     .from('TransformationLogs')
      //     .insert([{
      //         user_id: supabase.auth.getUser()?.id, // Get current user ID
      //         type: transformationType,
      //         payload: details,
      //         created_at: new Date().toISOString(),
      //         status: 'success'
      //     }]);

      // --- Generic Placeholder Supabase Call ---
      // Simulating a successful database operation
      console.log("Simulating transformation confirmation for:", transformationType, details)
      const mockDbCallSuccess = await new Promise((resolve) =>
        setTimeout(() => resolve({ error: null }), 1500),
      )

      if ((mockDbCallSuccess as any).error) {
        // Check if the mock call returned an error
        console.error("Error during transformation:", (mockDbCallSuccess as any).error.message)
        setError("Failed to complete transformation. Please try again.")
        setProcessing(false)
        return
      }
      // ==========================================================

      // If successful, navigate to completion page
      navigate("/cust-tran-complete", { state: { status: "success", transformationType } })
    } catch (err: any) {
      console.error("An unexpected error occurred during transformation:", err.message)
      setError("An unexpected error occurred during transformation. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    navigate("/customer-dashboard") // Or back to the initiation page
  }

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-main">
        <div className="container">
          <div className="transactions-card">
            {" "}
            {/* Reusing existing card style */}
            <div className="transactions-content">
              {" "}
              {/* Reusing existing content padding */}
              <div className="transactions-header">
                {" "}
                {/* Reusing header style */}
                <h2 className="transactions-title">Confirm Your Transformation</h2>
              </div>
              {error && <p className="error-message-box">{error}</p>}
              <div className="confirmation-details">
                <p>
                  <strong>Transformation Type:</strong> {transformationType}
                </p>
                {/* Dynamically render other details */}
                {Object.entries(details).map(([key, value]) => (
                  <p key={key}>
                    <strong>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                    </strong>{" "}
                    {typeof value === "object" && value !== null ? JSON.stringify(value) : String(value)}
                  </p>
                ))}
                <p className="warning-text">
                  Please review these details carefully. This action cannot be undone.
                </p>
              </div>
              <div className="button-group">
                <button
                  onClick={handleConfirmTransformation}
                  className="primary-button"
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Confirm Transformation"}
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
    </div>
  )
}