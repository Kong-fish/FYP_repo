import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, FileText, ArrowRightLeft, Eye } from "lucide-react";
// Assuming AdminDashboard.css is in the same directory as AdminDashboard.tsx
import "./AdminDashboard.css";

// Mock Supabase client for demonstration purposes.
// In a real application, you would import your actual configured Supabase client.
// Example: import { createClient } from '@supabase/supabase-js';
// const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');
const supabase = {
  auth: {
    signOut: async () => {
      console.log("Mock Supabase: Signing out...");
      return { error: null };
    },
    // Mock user for testing if needed
    currentUser: { uid: 'mock-user-id' }
  },
  from: (tableName: string) => ({
    select: (columns: string) => ({
      or: (filter: string) => ({
        limit: (count: number) => ({
          order: (column: string, options: { ascending: boolean }) => ({
            data: [], // Mock data
            error: null,
          }),
        }),
      }),
      // Mock for count exact
      then: (callback: (result: any) => void) => {
        callback({ data: [], error: null });
      },
    }),
  }),
};

// Mock DarkModeToggle component
// In a real application, ensure this path is correct if it exists.
// For now, we'll provide a basic functional mock.
const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Apply dark mode class to body based on state
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <button onClick={toggleDarkMode} className="dark-mode-toggle-button">
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};


// Mock Header.css if it's external, otherwise combine into AdminDashboard.css or Tailwind.
// For the purpose of making the code compile, we assume it's external,
// but the current styling heavily relies on AdminDashboard.css variables.
// If you have a separate Header.css, ensure its content is consistent or merged.
// import '../shared/Header.css'; // This line is commented out as its content isn't provided.

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
  
  return (
    <header className="header">
      <div className="header__content">
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

interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  phone_no: string;
  username: string;
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
  initiator_account_no: string;
  receiver_account_no: string;
  amount: number;
  type_of_transfer: string;
  transfer_datetime: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("customers");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingLoanApplications, setLoadingLoanApplications] = useState(true);
  const [loadingTransfers, setLoadingTransfers] = useState(true);

  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalLoanApplications, setTotalLoanApplications] = useState(0);
  const [totalDailyTransfers, setTotalDailyTransfers] = useState(0);

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
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        // Mock Supabase call
        const mockData = [
          { customer_id: 'cust_12345', first_name: 'John', last_name: 'Doe', phone_no: '123-456-7890', username: 'john.doe', Account: [{ account_status: 'active', balance: 1500.75 }] },
          { customer_id: 'cust_67890', first_name: 'Jane', last_name: 'Smith', phone_no: '098-765-4321', username: 'jane.s', Account: [{ account_status: 'inactive', balance: 50.20 }] },
        ].filter(c => 
          c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone_no.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const formattedCustomers: Customer[] = (mockData || []).map((c: any) => ({
          customer_id: c.customer_id,
          first_name: c.first_name,
          last_name: c.last_name,
          phone_no: c.phone_no,
          username: c.username,
          account_status: c.Account[0]?.account_status || "N/A",
          balance: c.Account[0]?.balance || 0,
        }));
        setCustomers(formattedCustomers);
        setTotalCustomers(mockData.length); // Use mockData length for total
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    if (activeTab === "customers") {
      fetchCustomers();
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    const fetchLoanApplications = async () => {
      setLoadingLoanApplications(true);
      try {
        // Mock Supabase call
        const mockData = [
          { loan_id: 'loan_a1b2', loan_amount: 10000, loan_intent: 'Home Renovation', final_approval: null, application_date: '2023-01-15T10:00:00Z', Customer: { first_name: 'Alice', last_name: 'Brown' } },
          { loan_id: 'loan_c3d4', loan_amount: 5000, loan_intent: 'Car Purchase', final_approval: true, application_date: '2023-01-10T14:30:00Z', Customer: { first_name: 'Bob', last_name: 'White' } },
          { loan_id: 'loan_e5f6', loan_amount: 2000, loan_intent: 'Education', final_approval: false, application_date: '2023-01-05T09:15:00Z', Customer: { first_name: 'Charlie', last_name: 'Green' } },
        ].filter(l => 
          String(l.loan_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.loan_intent.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.Customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.Customer.last_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const formattedLoanApplications: LoanApplication[] = (mockData || []).map(
          (loan: any) => ({
            loan_id: String(loan.loan_id),
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
        setTotalLoanApplications(mockData.length); // Use mockData length for total
      } catch (error) {
        console.error("Failed to fetch loan applications:", error);
      } finally {
        setLoadingLoanApplications(false);
      }
    };

    if (activeTab === "loans") {
      fetchLoanApplications();
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    const fetchTransfers = async () => {
      setLoadingTransfers(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Mock Supabase call
      const mockData = [
        { transaction_id: 'trans_x1y2', amount: 250, purpose: 'Rent', type_of_transfer: 'Credit', transfer_datetime: '2023-06-25T14:00:00Z', initiator_account_id: 'acc_1', receiver_account_no: 'rec_1', Account: { account_no: 'ACC001' } },
        { transaction_id: 'trans_z3w4', amount: 75, purpose: 'Groceries', type_of_transfer: 'Debit', transfer_datetime: '2023-06-25T10:30:00Z', initiator_account_id: 'acc_2', receiver_account_no: 'rec_2', Account: { account_no: 'ACC002' } },
        { transaction_id: 'trans_a5b6', amount: 120, purpose: 'Utilities', type_of_transfer: 'Credit', transfer_datetime: '2023-06-24T18:00:00Z', initiator_account_id: 'acc_3', receiver_account_no: 'rec_3', Account: { account_no: 'ACC003' } },
      ].filter(t => 
        String(t.transaction_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type_of_transfer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.receiver_account_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.Account.account_no.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const formattedTransfers: Transfer[] = (mockData || []).map((t: any) => ({
        transaction_id: t.transaction_id,
        initiator_account_no: t.Account?.account_no || "N/A",
        receiver_account_no: t.receiver_account_no || "N/A",
        amount: t.amount,
        transfer_datetime: new Date(t.transfer_datetime).toLocaleString(),
        type_of_transfer: t.type_of_transfer,
      }));
      setTransfers(formattedTransfers);
      
      // Calculate daily transfers from mock data
      const dailyTransfersCount = mockData.filter(t => 
        new Date(t.transfer_datetime).toDateString() === today.toDateString()
      ).length;

      setTotalDailyTransfers(dailyTransfersCount);
    } catch (error) {
      console.error("Failed to fetch transfers:", error);
    } finally {
      setLoadingTransfers(false);
    }
  };

    if (activeTab === "transfers") {
      fetchTransfers();
    }
  }, [activeTab, searchTerm]);

  const handleViewDetails = (type: string, id: string) => {
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
      <Header />

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
                                {String(loan.loan_id).substring(0, 8)}...
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
