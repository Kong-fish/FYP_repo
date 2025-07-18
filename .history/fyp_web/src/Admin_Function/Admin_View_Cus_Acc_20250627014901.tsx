import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js'; // Ensure this path is correct
import "../AdminDashboard.css"; // Reuse existing styles for layout and global variables
import "./AdminFunction.css"; // Import the new reusable function styles
import { User, CreditCard, Banknote, Briefcase, Home, CalendarDays, Phone, Mail, MapPin, Check, X, Trash2 } from 'lucide-react';

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
        .update({ account_status: 'Approved', approved_at: new Date().toISOString() })
        .eq('account_id', accountId);

      if (error) {
        throw error;
      }
      setMessage({ type: 'success', text: `Account ${accountId.substring(0, 8)}... approved successfully.` });
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

  // Handle Account Deletion
  const handleDeleteAccount = async (accountId: string) => {
    setLoading(true);
    try {
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
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="admin-smt-btn admin-smt-btn-primary mt-4"
            >
              Back to Dashboard
            </button>
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
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="admin-smt-btn admin-smt-btn-primary mt-4"
            >
              Back to Dashboard
            </button>
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
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="admin-smt-btn admin-smt-btn-ghost"
            >
              Back to Dashboard
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-md mb-4 text-center text-sm font-medium ${
                message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Container for Customer Personal Details Section */}
          <div className="customer-details-section-wrapper mb-8">
            <h3 className="admin-smt-card-title text-xl mb-4 flex items-center gap-2 font-semibold">
              <User size={20} /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
              <p className="text-lg admin-smt-card-description">
                <strong className="text-white font-medium flex items-center gap-2"><User size={16}/> Name:</strong> <span className="font-light text-gray-300">{customer.first_name} {customer.last_name}</span>
              </p>
              <p className="text-lg admin-smt-card-description">
                <strong className="text-white font-medium flex items-center gap-2"><Mail size={16}/> Username:</strong> <span className="font-light text-gray-300">{customer.username}</span>
              </p>
              <p className="text-lg admin-smt-card-description">
                <strong className="text-white font-medium flex items-center gap-2"><Phone size={16}/> Phone:</strong> <span className="font-light text-gray-300">{customer.phone_no}</span>
              </p>
              <p className="text-lg admin-smt-card-description">
                <strong className="text-white font-medium flex items-center gap-2"><CalendarDays size={16}/> Date of Birth:</strong> <span className="font-light text-gray-300">{formatDate(customer.date_of_birth)}</span>
              </p>
              <p className="text-lg admin-smt-card-description">
                <strong className="text-white font-medium flex items-center gap-2"><Banknote size={16}/> IC No:</strong> <span className="font-light text-gray-300">{customer.ic_no}</span>
              </p>
              <p className="text-lg admin-smt-card-description">
                <strong className="text-white font-medium flex items-center gap-2"><Briefcase size={16}/> Passport No:</strong> <span className="font-light text-gray-300">{customer.passport_no || 'N/A'}</span>
              </p>
              <p className="text-lg admin-smt-card-description">
                <strong className="text-white font-medium flex items-center gap-2"><MapPin size={16}/> Nationality:</strong> <span className="font-light text-gray-300">{customer.nationality}</span>
              </p>
              <p className="text-lg admin-smt-card-description col-span-1 md:col-span-2">
                <strong className="text-white font-medium flex items-center gap-2"><Home size={16}/> Home Address:</strong> <span className="font-light text-gray-300">{customer.home_address}</span>
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
                      <th className="admin-smt-table-head">Approve</th> {/* New Column */}
                      <th className="admin-smt-table-head">Reject</th>  {/* New Column */}
                      <th className="admin-smt-table-head">Delete</th>  {/* New Column */}
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

                        {/* Approve Button Column */}
                        <td className="admin-smt-table-cell">
                          {account.account_status === 'Pending' ? (
                            <button
                              onClick={() => handleApproveAccount(account.account_id)}
                              className="admin-smt-btn admin-smt-btn-ghost admin-smt-action-button"
                              title="Approve Account"
                            >
                              <Check className="admin-smt-action-icon text-green-500" />
                              <span className="sr-only">Approve</span>
                            </button>
                          ) : (
                            <span className="text-gray-500 opacity-50"><Check className="admin-smt-action-icon" /></span>
                          )}
                        </td>

                        {/* Reject Button Column */}
                        <td className="admin-smt-table-cell">
                          {account.account_status === 'Pending' || account.account_status === 'Active' ? (
                            <button
                              onClick={() => handleRejectAccount(account.account_id)}
                              className="admin-smt-btn admin-smt-btn-ghost admin-smt-action-button"
                              title="Reject Account"
                            >
                              <X className="admin-smt-action-icon text-red-500" />
                              <span className="sr-only">Reject</span>
                            </button>
                          ) : (
                            <span className="text-gray-500 opacity-50"><X className="admin-smt-action-icon" /></span>
                          )}
                        </td>

                        {/* Delete Button Column */}
                        <td className="admin-smt-table-cell">
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
