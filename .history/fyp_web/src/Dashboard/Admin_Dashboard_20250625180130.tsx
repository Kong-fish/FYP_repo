import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, FileText, ArrowRightLeft, Eye, ArrowLeft } from "lucide-react";
import "./AdminDashboard.css";
import supabase from '../supbaseClient.js';
import '../shared/Header.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

// Header Component (remains largely the same, but included for completeness)
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
    navigate("/customer-dashboard");
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

// Interface Definitions
interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  phone_no: string;
  username: string; // Assuming username can act as email for display
  account_status: string;
  balance: number;
}

interface LoanApplication {
  loan_id: string;
  customer_first_name: string;
  customer_last_name: string;
  loan_amount: number;
  loan_intent: string;
  final_approval: boolean | null;
  application_date: string;
}

interface Transfer {
  transaction_id: string;
  initiator_account_no: string; // From the initiator's account
  receiver_account_no: string;
  amount: number;
  transfer_datetime: string;
  type_of_transfer: string; // Using this as status for display
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("customers");

  // State variables for fetched data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  // State variables for loading indicators
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingLoanApplications, setLoadingLoanApplications] = useState(true);
  const [loadingTransfers, setLoadingTransfers] = useState(true);

  // State variables for stat card counts
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalLoanApplications, setTotalLoanApplications] = useState(0);
  const [totalDailyTransfers, setTotalDailyTransfers] = useState(0);

  // Helper function to determine badge class based on status
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
      case "null": // For loan applications that are not yet approved/rejected
        return "badge-warning";
      case "inactive":
      case "rejected":
      case "failed":
        return "badge-error";
      default:
        return "badge-default";
    }
  };

  // --- useEffect hook to fetch Customers data ---
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        let query = supabase
          .from("Customer")
          .select(
            `
            customer_id,
            first_name,
            last_name,
            phone_no,
            username,
            Account (account_status, balance)
            `
          );

        if (searchTerm) {
          query = query.or(
            `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,phone_no.ilike.%${searchTerm}%`
          );
        }

        // Fetch limited data for the table display
        const { data, error } = await query
          .limit(10) // Limit to 10 for dashboard view
          .order("created_at", { ascending: false });

        // Fetch total count for the stat card
        const { count: totalCount, error: countError } = await supabase
          .from("Customer")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching customers:", error);
        } else {
          // Map the fetched data to match the Customer interface
          const formattedCustomers: Customer[] = (data || []).map((c: any) => ({
            customer_id: c.customer_id,
            first_name: c.first_name,
            last_name: c.last_name,
            phone_no: c.phone_no,
            username: c.username,
            // Assuming a customer can have multiple accounts, taking the first one's status and balance
            account_status: c.Account[0]?.account_status || "N/A",
            balance: c.Account[0]?.balance || 0,
          }));
          setCustomers(formattedCustomers);
          setTotalCustomers(totalCount || 0); // Update total count
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    // Only fetch if the 'customers' tab is active
    if (activeTab === "customers") {
      fetchCustomers();
    }
  }, [activeTab, searchTerm]); // Re-run when activeTab or searchTerm changes

  // --- useEffect hook to fetch Loan Applications data ---
  useEffect(() => {
    const fetchLoanApplications = async () => {
      setLoadingLoanApplications(true);
      try {
        let query = supabase
          .from("Loan")
          .select(
            `
            loan_id,
            loan_amount,
            loan_intent,
            final_approval,
            application_date,
            Customer (first_name, last_name)
            `
          );

        if (searchTerm) {
          query = query.or(
            `loan_id.ilike.%${searchTerm}%,loan_intent.ilike.%${searchTerm}%,Customer.first_name.ilike.%${searchTerm}%,Customer.last_name.ilike.%${searchTerm}%`
          );
        }

        const { data, error } = await query
          .limit(10) // Limit to 10 for dashboard view
          .order("application_date", { ascending: false });

        const { count: totalCount, error: countError } = await supabase
          .from("Loan")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching loan applications:", error);
        } else {
          const formattedLoanApplications: LoanApplication[] = (data || []).map(
            (loan: any) => ({
              loan_id: loan.loan_id,
              customer_first_name: loan.Customer?.first_name || "N/A",
              customer_last_name: loan.Customer?.last_name || "",
              loan_amount: loan.loan_amount,
              loan_intent: loan.loan_intent,
              final_approval: loan.final_approval,
              application_date: new Date(
                loan.application_date
              ).toLocaleDateString(),
            })
          );
          setLoanApplications(formattedLoanApplications);
          setTotalLoanApplications(totalCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch loan applications:", error);
      } finally {
        setLoadingLoanApplications(false);
      }
    };

    // Only fetch if the 'loans' tab is active
    if (activeTab === "loans") {
      fetchLoanApplications();
    }
  }, [activeTab, searchTerm]); // Re-run when activeTab or searchTerm changes

  // --- useEffect hook to fetch Transfers data ---
  useEffect(() => {
    const fetchTransfers = async () => {
      setLoadingTransfers(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

      try {
        let query = supabase
          .from("Transaction")
          .select(
            `
            transaction_id,
            amount,
            purpose,
            type_of_transfer,
            transfer_datetime,
            initiator_account_id,
            receiver_account_no,
            Account!Transaction_initiator_account_id_fkey(account_no)
            `
          );

        if (searchTerm) {
          query = query.or(
            `transaction_id.ilike.%${searchTerm}%,type_of_transfer.ilike.%${searchTerm}%,receiver_account_no.ilike.%${searchTerm}%,Account.account_no.ilike.%${searchTerm}%`
          );
        }

        const { data, error } = await query
          .limit(10) // Limit to 10 for dashboard view
          .order("transfer_datetime", { ascending: false });

        // Fetch daily transfers count for the stat card
        const { count: dailyTransfersCount, error: dailyCountError } =
          await supabase
            .from("Transaction")
            .select("*", { count: "exact", head: true })
            .gte("transfer_datetime", today.toISOString())
            .lt("transfer_datetime", tomorrow.toISOString());

        if (error) {
          console.error("Error fetching transfers:", error);
        } else {
          const formattedTransfers: Transfer[] = (data || []).map((t: any) => ({
            transaction_id: t.transaction_id,
            initiator_account_no: t.Account?.account_no || "N/A", // Access account_no from the joined Account data
            receiver_account_no: t.receiver_account_no || "N/A",
            amount: t.amount,
            transfer_datetime: new Date(t.transfer_datetime).toLocaleString(),
            type_of_transfer: t.type_of_transfer, // Using this as a status for display
          }));
          setTransfers(formattedTransfers);
          setTotalDailyTransfers(dailyTransfersCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch transfers:", error);
      } finally {
        setLoadingTransfers(false);
      }
    };

    // Only fetch if the 'transfers' tab is active
    if (activeTab === "transfers") {
      fetchTransfers();
    }
  }, [activeTab, searchTerm]); // Re-run when activeTab or searchTerm changes

  // Function to handle navigation for View Details
  const handleViewDetails = (type: string, id: string) => {
    // Implement navigation logic based on the type and ID
    if (type === 'customer') {
      navigate(`/admin-approve-account/${id}`);
    } else if (type === 'loan') {
      navigate(`/admin/loan/${id}`);
    } else if (type === 'transfer') {
      navigate(`/admin/transfer/${id}`);
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="main-content">
        <header className="admin-header">
          <div className="header-content">
            <div className="header-left">
              <div className="brand-section">
                <div className="brand-logo"></div>
                <h1 className="brand-title">Admin Dashboard</h1>
              </div>
            </div>
            <div className="header-right">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button className="btn btn-primary">New Entry</button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Total Customers</h3>
              <Users className="stat-icon" />
            </div>
            <div className="card-content">
              <div className="stat-number">
                {totalCustomers.toLocaleString()}
              </div>
              <p className="stat-description">
                +12% from last month
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Total Loan Applications</h3>
              <FileText className="stat-icon" />
            </div>
            <div className="card-content">
              <div className="stat-number">
                {totalLoanApplications.toLocaleString()}
              </div>
              <p className="stat-description">
                +5% from last month
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Daily Transfers</h3>
              <ArrowRightLeft className="stat-icon" />
            </div>
            <div className="card-content">
              <div className="stat-number">
                {totalDailyTransfers.toLocaleString()}
              </div>
              <p className="stat-description">
                +8% from yesterday
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for different sections */}
        <div className="tabs-container">
          <div className="tabs-list">
            <button
              className={`tab-trigger ${
                activeTab === "customers" ? "active" : ""
              }`}
              onClick={() => setActiveTab("customers")}
            >
              Customer Accounts
            </button>
            <button
              className={`tab-trigger ${
                activeTab === "loans" ? "active" : ""
              }`}
              onClick={() => setActiveTab("loans")}
            >
              Loan Applications
            </button>
            <button
              className={`tab-trigger ${
                activeTab === "transfers" ? "active" : ""
              }`}
              onClick={() => setActiveTab("transfers")}
            >
              Transfers
            </button>
          </div>

          {/* Customer Accounts Tab Content */}
          {activeTab === "customers" && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Customer Accounts</h3>
                  <p className="card-description">
                    Manage and view all customer accounts
                  </p>
                </div>
                <div className="card-content">
                  {loadingCustomers ? (
                    <p>Loading customers...</p>
                  ) : customers.length === 0 ? (
                    <p>No customer accounts found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead className="table-header">
                          <tr>
                            <th className="table-head">Customer ID</th>
                            <th className="table-head">Name</th>
                            <th className="table-head">Email/Username</th>
                            <th className="table-head">Phone</th>
                            <th className="table-head">Status</th>
                            <th className="table-head">Balance</th>
                            <th className="table-head">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="table-body">
                          {customers.map((customer) => (
                            <tr key={customer.customer_id} className="table-row">
                              <td className="table-cell table-cell-bold">
                                {customer.customer_id.substring(0, 8)}...
                              </td>
                              <td className="table-cell">
                                {customer.first_name} {customer.last_name}
                              </td>
                              <td className="table-cell">{customer.username}</td>
                              <td className="table-cell">{customer.phone_no}</td>
                              <td className="table-cell">
                                <span
                                  className={`badge ${getStatusClass(
                                    customer.account_status
                                  )}`}
                                >
                                  {customer.account_status}
                                </span>
                              </td>
                              <td className="table-cell table-cell-bold">
                                ${customer.balance?.toLocaleString()}
                              </td>
                              <td className="table-cell">
                                <button
                                  className="btn btn-ghost action-button"
                                  onClick={() => handleViewDetails('customer', customer.customer_id)}
                                >
                                  <Eye className="action-icon" />
                                  <span className="sr-only">View Details</span>
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
            </div>
          )}

          {/* Loan Applications Tab Content */}
          {activeTab === "loans" && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Loan Applications</h3>
                  <p className="card-description">
                    Review and manage loan applications
                  </p>
                </div>
                <div className="card-content">
                  {loadingLoanApplications ? (
                    <p>Loading loan applications...</p>
                  ) : loanApplications.length === 0 ? (
                    <p>No loan applications found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead className="table-header">
                          <tr>
                            <th className="table-head">Application ID</th>
                            <th className="table-head">Customer</th>
                            <th className="table-head">Amount</th>
                            <th className="table-head">Intent</th>
                            <th className="table-head">Approval</th>
                            <th className="table-head">Date</th>
                            <th className="table-head">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="table-body">
                          {loanApplications.map((loan) => (
                            <tr key={loan.loan_id} className="table-row">
                              <td className="table-cell table-cell-bold">
                                {loan.loan_id.substring(0, 8)}...
                              </td>
                              <td className="table-cell">
                                {loan.customer_first_name}{" "}
                                {loan.customer_last_name}
                              </td>
                              <td className="table-cell table-cell-bold">
                                ${loan.loan_amount?.toLocaleString()}
                              </td>
                              <td className="table-cell">{loan.loan_intent}</td>
                              <td className="table-cell">
                                <span
                                  className={`badge ${getStatusClass(
                                    loan.final_approval
                                  )}`}
                                >
                                  {loan.final_approval === true
                                    ? "Approved"
                                    : loan.final_approval === false
                                    ? "Rejected"
                                    : "Pending"}
                                </span>
                              </td>
                              <td className="table-cell">
                                {loan.application_date}
                              </td>
                              <td className="table-cell">
                                <button
                                  className="btn btn-ghost action-button"
                                  onClick={() => handleViewDetails('loan', loan.loan_id)}
                                >
                                  <Eye className="action-icon" />
                                  <span className="sr-only">Review Application</span>
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
            </div>
          )}

          {/* Transfers Tab Content */}
          {activeTab === "transfers" && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Transfers</h3>
                  <p className="card-description">
                    Monitor all transfer transactions
                  </p>
                </div>
                <div className="card-content">
                  {loadingTransfers ? (
                    <p>Loading transfers...</p>
                  ) : transfers.length === 0 ? (
                    <p>No transfers found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="table">
                        <thead className="table-header">
                          <tr>
                            <th className="table-head">Transfer ID</th>
                            <th className="table-head">From Account</th>
                            <th className="table-head">To Account</th>
                            <th className="table-head">Amount</th>
                            <th className="table-head">Type</th>
                            <th className="table-head">Date & Time</th>
                            <th className="table-head">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="table-body">
                          {transfers.map((transfer) => (
                            <tr key={transfer.transaction_id} className="table-row">
                              <td className="table-cell table-cell-bold">
                                {transfer.transaction_id.substring(0, 8)}...
                              </td>
                              <td className="table-cell">
                                {transfer.initiator_account_no}
                              </td>
                              <td className="table-cell">
                                {transfer.receiver_account_no}
                              </td>
                              <td className="table-cell table-cell-bold">
                                ${transfer.amount?.toLocaleString()}
                              </td>
                              <td className="table-cell">
                                <span
                                  className={`badge ${getStatusClass(
                                    transfer.type_of_transfer
                                  )}`}
                                >
                                  {transfer.type_of_transfer}
                                </span>
                              </td>
                              <td className="table-cell">
                                {transfer.transfer_datetime}
                              </td>
                              <td className="table-cell">
                                <button
                                  className="btn btn-ghost action-button"
                                  onClick={() => handleViewDetails('transfer', transfer.transaction_id)}
                                >
                                  <Eye className="action-icon" />
                                  <span className="sr-only">View Details</span>
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}