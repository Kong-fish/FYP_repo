import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js'; // Ensure this path is correct
import "./AdminFunction.css";
import { User, CreditCard, Banknote, Briefcase, Home, CalendarDays, Phone, Mail, MapPin, Check, X, Trash2, Power } from 'lucide-react'; // Added Power icon for Terminate

// Define interfaces for Customer and Account data based on your schema
interface CustomerDetail {
  customer_id: string;
  first_name: string;
  last_name: string;
  phone_no: string;
  username: string;
  nationality: string;
  home_address: string;
  ic_no: string;
  passport_no: string | null;
  date_of_birth: string; // Assuming it comes as a string, will format
}

interface AccountDetail {
  account_id: string;
  account_no: string;
  balance: number;
  account_type: string; // Assuming 'USER-DEFINED' means it's a string enum
  account_status: string; // Assuming 'USER-DEFINED' means it's a string enum
  nickname: string | null;
  approved_at: string | null; // Keep for data structure, but won't display
  created_at: string;
}

const AdminViewCusAcc: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>(); // Get customerId from URL
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [accounts, setAccounts] = useState<AccountDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Function to fetch customer details and accounts
  const fetchCustomerDetails = async () => {
    if (!customerId) {
      setError("Customer ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null); // Clear previous messages

    try {
      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from('Customer')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (customerError) {
        throw customerError;
      }
      setCustomer(customerData as CustomerDetail);

      // Fetch associated accounts
      const { data: accountData, error: accountError } = await supabase
        .from('Account')
        .select('*')
        .eq('customer_id', customerId);

      if (accountError) {
        throw accountError;
      }
      setAccounts(accountData as AccountDetail[]);

    } catch (err: any) {
      console.error("Error fetching customer details or accounts:", err);
      setError(`Failed to load details: ${err.message || 'An unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]); // Re-run when customerId changes

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A';
  };

  // Helper function to format datetime
  const formatDateTime = (dateTimeString: string) => {
    return dateTimeString ? new Date(dateTimeString).toLocaleString() : 'N/A';
  };

  // Helper function to get status badge class (reusing logic from AdminDashboard)
  const getStatusClass = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "approved":
        return "admin-smt-badge-success";
      case "pending":
      case "under review":
        return "admin-smt-badge-warning";
      case "inactive":
      case "rejected":
      case "closed":
        return "admin-smt-badge-error";
      default:
        return "admin-smt-badge-default";
    }
  };

  // Handle Account Approval
  const handleApproveAccount = async (accountId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('Account')
        .update({ account_status: 'Active', approved_at: new Date().toISOString() }) // Change to 'Active' upon approval
        .eq('account_id', accountId);

      if (error) {
        throw error;
      }
      setMessage({ type: 'success', text: `Account ${accountId.substring(0, 8)}... approved and set to Active.` });
      fetchCustomerDetails(); // Re-fetch to update table
    } catch (err: any) {
      console.error("Error approving account:", err);
      setMessage({ type: 'error', text: `Failed to approve account: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Rejection
  const handleRejectAccount = async (accountId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('Account')
        .update({ account_status: 'Rejected' })
        .eq('account_id', accountId);

      if (error) {
        throw error;
      }
      setMessage({ type: 'success', text: `Account ${accountId.substring(0, 8)}... rejected successfully.` });
      fetchCustomerDetails(); // Re-fetch to update table
    } catch (err: any) {
      console.error("Error rejecting account:", err);
      setMessage({ type: 'error', text: `Failed to reject account: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Termination (New function)
  const handleTerminateAccount = async (accountId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('Account')
        .update({ account_status: 'Inactive' }) // Set to Inactive or Closed
        .eq('account_id', accountId);

      if (error) {
        throw error;
      }
      setMessage({ type: 'success', text: `Account ${accountId.substring(0, 8)}... terminated (set to Inactive).` });
      fetchCustomerDetails(); // Re-fetch to update table
    } catch (err: any) {
      console.error("Error terminating account:", err);
      setMessage({ type: 'error', text: `Failed to terminate account: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async (accountId: string) => {
    setLoading(true);
    try {
      // First, check if there are any related transactions. If so, prevent deletion or handle appropriately.
      // For simplicity, we'll proceed with deletion here, but in a real app, you might soft delete or
      // require all related transactions/loans to be resolved first.
      const { error } = await supabase
        .from('Account')
        .delete()
        .eq('account_id', accountId);

      if (error) {
        throw error;
      }
      setMessage({ type: 'success', text: `Account ${accountId.substring(0, 8)}... deleted successfully.` });
      fetchCustomerDetails(); // Re-fetch to update table
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setMessage({ type: 'error', text: `Failed to delete account: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="admin-smt-container">
        <main className="admin-smt-main-content">
          <div className="admin-smt-card">
            <p className="text-lg text-gray-400">Loading customer details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-smt-container">
        <main className="admin-smt-main-content">
          <div className="admin-smt-card">
            <p className="text-lg text-red-500">Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="admin-smt-container">
        <main className="admin-smt-main-content">
          <div className="admin-smt-card">
            <p className="text-lg text-gray-400">No customer found with ID: {customerId}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-smt-container">
      <main className="admin-smt-main-content">
        <div className="admin-smt-card">
          <div className="admin-smt-card-header mb-6">
            <h2 className="admin-smt-card-title text-2xl font-bold">Customer Details</h2>
          </div>

          {message && (
            <div className={`p-3 rounded-md mb-4 text-center text-sm font-medium ${
                message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Container for Customer Personal Details Section */}
          <div className="customer-details-section-wrapper">
            <h3 className="customer-details-section-title">
              <User size={20} /> Personal Information
            </h3>
            <div className="customer-details-grid">
              <p className="customer-detail-item">
                <strong className="customer-detail-label"><User size={16} /> Name:</strong> <span className="customer-detail-value">{customer.first_name} {customer.last_name}</span>
              </p>
              <p className="customer-detail-item">
                <strong className="customer-detail-label"><Mail size={16} /> Username:</strong> <span className="customer-detail-value">{customer.username}</span>
              </p>
              <p className="customer-detail-item">
                <strong className="customer-detail-label"><Phone size={16} /> Phone:</strong> <span className="customer-detail-value">{customer.phone_no}</span>
              </p>
              <p className="customer-detail-item">
                <strong className="customer-detail-label"><CalendarDays size={16} /> Date of Birth:</strong> <span className="customer-detail-value">{formatDate(customer.date_of_birth)}</span>
              </p>
              <p className="customer-detail-item">
                <strong className="customer-detail-label"><Banknote size={16} /> IC No:</strong> <span className="customer-detail-value">{customer.ic_no}</span>
              </p>
              <p className="customer-detail-item">
                <strong className="customer-detail-label"><Briefcase size={16} /> Passport No:</strong> <span className="customer-detail-value">{customer.passport_no || 'N/A'}</span>
              </p>
              <p className="customer-detail-item">
                <strong className="customer-detail-label"><MapPin size={16} /> Nationality:</strong> <span className="customer-detail-value">{customer.nationality}</span>
              </p>
              <p className="customer-detail-item customer-detail-full-width">
                <strong className="customer-detail-label"><Home size={16} /> Home Address:</strong> <span className="customer-detail-value">{customer.home_address}</span>
              </p>
            </div>
          </div>

          {/* Container for Customer Accounts Section */}
          <div className="customer-details-section-wrapper">
            <h3 className="admin-smt-card-title text-xl mb-4 flex items-center gap-2 font-semibold">
              <CreditCard size={20} /> Associated Accounts
            </h3>
            {accounts.length === 0 ? (
              <p className="text-lg admin-smt-card-description">No bank accounts found for this customer.</p>
            ) : (
              <div className="admin-smt-table-container">
                <table className="admin-smt-table">
                  <thead className="admin-smt-table-header">
                    <tr>
                      <th className="admin-smt-table-head">Account No</th>
                      <th className="admin-smt-table-head">Nickname</th>
                      <th className="admin-smt-table-head">Type</th>
                      <th className="admin-smt-table-head">Balance</th>
                      <th className="admin-smt-table-head">Status</th>
                      <th className="admin-smt-table-head">Created At</th>
                      <th className="admin-smt-table-head">Actions</th> {/* Merged column */}
                    </tr>
                  </thead>
                  <tbody className="admin-smt-table-body">
                    {accounts.map((account) => (
                      <tr key={account.account_id} className="admin-smt-table-row">
                        <td className="admin-smt-table-cell admin-smt-table-cell-bold">
                          <span className="font-normal text-gray-300">{account.account_no}</span>
                        </td>
                        <td className="admin-smt-table-cell"><span className="font-normal text-gray-300">{account.nickname || 'N/A'}</span></td>
                        <td className="admin-smt-table-cell"><span className="font-normal text-gray-300">{account.account_type}</span></td>
                        <td className="admin-smt-table-cell admin-smt-table-cell-bold">
                          <span className="font-normal text-gray-300">${account.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </td>
                        <td className="admin-smt-table-cell">
                          <span className={`admin-smt-badge ${getStatusClass(account.account_status)}`}>
                            {account.account_status}
                          </span>
                        </td>
                        <td className="admin-smt-table-cell"><span className="font-normal text-gray-300">{formatDateTime(account.created_at)}</span></td>

                        {/* Actions Column with conditional buttons */}
                        <td className="admin-smt-table-cell flex gap-2 items-center">
                          {account.account_status === 'Pending' ? (
                            // Approve button for Pending accounts
                            <button
                              onClick={() => handleApproveAccount(account.account_id)}
                              className="admin-smt-btn admin-smt-btn-ghost admin-smt-action-button"
                              title="Approve Account"
                            >
                              <Check className="admin-smt-action-icon text-green-500" />
                              <span className="sr-only">Approve</span>
                            </button>
                          ) : (account.account_status === 'Active' || account.account_status === 'Approved') ? (
                            // Terminate button for Approved/Active accounts
                            <button
                              onClick={() => handleTerminateAccount(account.account_id)}
                              className="admin-smt-btn admin-smt-btn-ghost admin-smt-action-button"
                              title="Terminate Account (Set Inactive)"
                            >
                              <Power className="admin-smt-action-icon text-orange-500" />
                              <span className="sr-only">Terminate</span>
                            </button>
                          ) : (
                            // Placeholder for other statuses (e.g., Rejected, Inactive)
                            <span className="text-gray-500 opacity-30 flex items-center justify-center w-8 h-8">
                                <Check className="admin-smt-action-icon" /> {/* Using Check as a generic placeholder */}
                            </span>
                          )}

                          {/* Reject Button: Available for Pending and Active accounts */}
                          {(account.account_status === 'Pending' || account.account_status === 'Active' || account.account_status === 'Approved') ? (
                            <button
                              onClick={() => handleRejectAccount(account.account_id)}
                              className="admin-smt-btn admin-smt-btn-ghost admin-smt-action-button"
                              title="Reject Account"
                            >
                              <X className="admin-smt-action-icon text-red-500" />
                              <span className="sr-only">Reject</span>
                            </button>
                          ) : (
                            <span className="text-gray-500 opacity-30 flex items-center justify-center w-8 h-8">
                                <X className="admin-smt-action-icon" />
                            </span>
                          )}


                          {/* Delete Button: Always available (consider actual business logic for deletion) */}
                          <button
                            onClick={() => handleDeleteAccount(account.account_id)}
                            className="admin-smt-btn admin-smt-btn-ghost admin-smt-action-button"
                            title="Delete Account"
                          >
                            <Trash2 className="admin-smt-action-icon text-red-700" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminViewCusAcc;
