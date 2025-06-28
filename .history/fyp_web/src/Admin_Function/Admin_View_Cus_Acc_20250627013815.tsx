import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js'; // Ensure this path is correct
import "./AdminFunction.css"; // Import the new reusable function styles
import { User, CreditCard, Banknote, Briefcase, Home, CalendarDays, Phone, Mail, MapPin } from 'lucide-react';

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
  approved_at: string | null;
  created_at: string;
}

const AdminViewCusAcc: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>(); // Get customerId from URL
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [accounts, setAccounts] = useState<AccountDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) {
        setError("Customer ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

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


  if (loading) {
    return (
      <div className="admin-smt-container">
        <main className="admin-smt-main-content">
          <div className="admin-smt-card">
            <p>Loading customer details...</p>
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
            <p className="text-red-500">Error: {error}</p>
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
            <p>No customer found with ID: {customerId}</p>
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

          {/* New container for customer details sections */}
          <div className="customer-details-section-wrapper">
            {/* Customer Personal Details Section */}
            <div className="mb-8"> {/* mb-8 for spacing between this and the next section *within* the wrapper */}
              <h3 className="admin-smt-card-title text-xl mb-4 flex items-center gap-2">
                <User size={20} /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="admin-smt-card-description">
                  <strong className="text-white flex items-center gap-2"><User size={16}/> Name:</strong> {customer.first_name} {customer.last_name}
                </p>
                <p className="admin-smt-card-description">
                  <strong className="text-white flex items-center gap-2"><Mail size={16}/> Username:</strong> {customer.username}
                </p>
                <p className="admin-smt-card-description">
                  <strong className="text-white flex items-center gap-2"><Phone size={16}/> Phone:</strong> {customer.phone_no}
                </p>
                <p className="admin-smt-card-description">
                  <strong className="text-white flex items-center gap-2"><CalendarDays size={16}/> Date of Birth:</strong> {formatDate(customer.date_of_birth)}
                </p>
                <p className="admin-smt-card-description">
                  <strong className="text-white flex items-center gap-2"><Banknote size={16}/> IC No:</strong> {customer.ic_no}
                </p>
                <p className="admin-smt-card-description">
                  <strong className="text-white flex items-center gap-2"><Briefcase size={16}/> Passport No:</strong> {customer.passport_no || 'N/A'}
                </p>
                <p className="admin-smt-card-description">
                  <strong className="text-white flex items-center gap-2"><MapPin size={16}/> Nationality:</strong> {customer.nationality}
                </p>
                <p className="admin-smt-card-description col-span-1 md:col-span-2">
                  <strong className="text-white flex items-center gap-2"><Home size={16}/> Home Address:</strong> {customer.home_address}
                </p>
              </div>
            </div>

            {/* Customer Accounts Section */}
            <div>
              <h3 className="admin-smt-card-title text-xl mb-4 flex items-center gap-2">
                <CreditCard size={20} /> Associated Accounts
              </h3>
              {accounts.length === 0 ? (
                <p className="admin-smt-card-description">No bank accounts found for this customer.</p>
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
                        <th className="admin-smt-table-head">Approved At</th>
                      </tr>
                    </thead>
                    <tbody className="admin-smt-table-body">
                      {accounts.map((account) => (
                        <tr key={account.account_id} className="admin-smt-table-row">
                          <td className="admin-smt-table-cell admin-smt-table-cell-bold">
                            {account.account_no}
                          </td>
                          <td className="admin-smt-table-cell">{account.nickname || 'N/A'}</td>
                          <td className="admin-smt-table-cell">{account.account_type}</td>
                          <td className="admin-smt-table-cell admin-smt-table-cell-bold">
                            ${account.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="admin-smt-table-cell">
                            <span className={`admin-smt-badge ${getStatusClass(account.account_status)}`}>
                              {account.account_status}
                            </span>
                          </td>
                          <td className="admin-smt-table-cell">{formatDateTime(account.created_at)}</td>
                          <td className="admin-smt-table-cell">{formatDateTime(account.approved_at || '')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div> 
        </div>
      </main>
    </div>
  );
};

export default AdminViewCusAcc;
