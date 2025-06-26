import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./AdminDashboard.css"; // Ensure this path is correct relative to AdminDashboard.tsx
import { Search, Users, FileText, ArrowRightLeft, Eye } from "lucide-react";
import supabase from '../supbaseClient.js';

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
  transfer_datetime: string;
  type_of_transfer: string;
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
      return status ? "admin-badge-success" : "admin-badge-error";
    }
    switch (status?.toLowerCase()) {
      case "active":
      case "completed":
      case "approved":
        return "admin-badge-success";
      case "pending":
      case "under review":
      case "null":
        return "admin-badge-warning";
      case "inactive":
      case "rejected":
      case "failed":
        return "admin-badge-error";
      default:
        return "admin-badge-default";
    }
  };

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

        const { data, error } = await query
          .limit(10)
          .order("created_at", { ascending: false });

        const { count: totalCount } = await supabase
          .from("Customer")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching customers:", error);
        } else {
          const formattedCustomers: Customer[] = (data || []).map((c: any) => ({
            customer_id: c.customer_id,
            first_name: c.first_name,
            last_name: c.last_name,
            phone_no: c.phone_no,
            username: c.username,
            account_status: c.Account[0]?.account_status || "N/A",
            balance: c.Account[0]?.balance || 0,
          }));
          setCustomers(formattedCustomers);
          setTotalCustomers(totalCount || 0);
        }
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
          .limit(10)
          .order("application_date", { ascending: false });

        const { count: totalCount } = await supabase
          .from("Loan")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error fetching loan applications:", error);
        } else {
          const formattedLoanApplications: LoanApplication[] = (data || []).map(
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
          setTotalLoanApplications(totalCount || 0);
        }
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

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

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
          .limit(10)
          .order("transfer_datetime", { ascending: false });

        const { count: dailyTransfersCount } =
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
            initiator_account_no: t.Account?.account_no || "N/A",
            receiver_account_no: t.receiver_account_no || "N/A",
            amount: t.amount,
            transfer_datetime: new Date(t.transfer_datetime).toLocaleString(),
            type_of_transfer: t.type_of_transfer,
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
    <div className="admin-container"> {/* Renamed from admin-smt-container */}
      {/* Header Section - Now uses admin-header-layout */}
      <header className="admin-header-layout">
        {/* Brand Section (Left Side) */}
        <div className="admin-brand-section"> {/* Renamed from admin-smt-brand-section */}
          <div className="admin-brand-logo"></div> {/* Renamed from admin-smt-brand-logo */}
          <h1 className="admin-brand-title">Admin Dashboard</h1> {/* Renamed from admin-smt-brand-title */}
        </div>

        {/* Search Container and New Entry Button (Right Side) */}
        {/* The 'New Entry' button was outside the search container in the image, so I've separated them
            but kept them logically grouped if the layout intends them to be together on the right.
            The admin-header-layout's 'gap' and 'flex-wrap' will manage their spacing and wrapping. */}
        <div className="admin-header-right"> {/* A new div to group search and button if needed for responsive stacking */}
            <div className="admin-search-container"> {/* Renamed from admin-smt-search-container */}
                <Search className="admin-search-icon" /> {/* Renamed from admin-smt-search-icon */}
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input" // Renamed from admin-smt-search-input
                />
            </div>
            {/* The "New Entry" button needs to be explicitly placed.
               I'll place it after the search bar within the right grouping,
               as it appeared visually separate but aligned on the right in the image. */}
            <button className="admin-btn admin-btn-primary">New Entry</button> {/* Renamed from admin-smt-btn admin-smt-btn-primary */}
        </div>
      </header>

      <main className="admin-main-content"> {/* Renamed from admin-smt-main-content */}
        <div className="admin-stats-grid"> {/* Renamed from admin-smt-stats-grid */}
          <div className="admin-card"> {/* Renamed from admin-smt-card */}
            <div className="admin-card-header"> {/* Renamed from admin-smt-card-header */}
              <h3 className="admin-card-title">Total Customers</h3> {/* Renamed from admin-smt-card-title */}
              <Users className="admin-stat-icon" /> {/* Renamed from admin-smt-stat-icon */}
            </div>
            <div className="admin-card-content"> {/* Renamed from admin-smt-card-content */}
              <div className="admin-stat-number"> {/* Renamed from admin-smt-stat-number */}
                {totalCustomers.toLocaleString()}
              </div>
              <p className="admin-stat-description"> {/* Renamed from admin-smt-stat-description */}
                +12% from last month
              </p>
            </div>
          </div>
          <div className="admin-card"> {/* Renamed from admin-smt-card */}
            <div className="admin-card-header"> {/* Renamed from admin-smt-card-header */}
              <h3 className="admin-card-title">Total Loan Applications</h3> {/* Renamed from admin-smt-card-title */}
              <FileText className="admin-stat-icon" /> {/* Renamed from admin-smt-stat-icon */}
            </div>
            <div className="admin-card-content"> {/* Renamed from admin-smt-card-content */}
              <div className="admin-stat-number"> {/* Renamed from admin-smt-stat-number */}
                {totalLoanApplications.toLocaleString()}
              </div>
              <p className="admin-stat-description"> {/* Renamed from admin-smt-stat-description */}
                +5% from last month
              </p>
            </div>
          </div>
          <div className="admin-card"> {/* Renamed from admin-smt-card */}
            <div className="admin-card-header"> {/* Renamed from admin-smt-card-header */}
              <h3 className="admin-card-title">Daily Transfers</h3> {/* Renamed from admin-smt-card-title */}
              <ArrowRightLeft className="admin-stat-icon" /> {/* Renamed from admin-smt-stat-icon */}
            </div>
            <div className="admin-card-content"> {/* Renamed from admin-smt-card-content */}
              <div className="admin-stat-number"> {/* Renamed from admin-smt-stat-number */}
                {totalDailyTransfers.toLocaleString()}
              </div>
              <p className="admin-stat-description"> {/* Renamed from admin-smt-stat-description */}
                +8% from yesterday
              </p>
            </div>
          </div>
        </div>

        <div className="admin-tabs-container"> {/* Renamed from admin-smt-tabs-container */}
          <div className="admin-tabs-list"> {/* Renamed from admin-smt-tabs-list */}
            <button
              className={`admin-tab-trigger ${activeTab === "customers" ? "active" : ""}`} // Renamed from admin-smt-tab-trigger
              onClick={() => setActiveTab("customers")}
            >
              Customer Accounts
            </button>
            <button
              className={`admin-tab-trigger ${activeTab === "loans" ? "active" : ""}`} // Renamed from admin-smt-tab-trigger
              onClick={() => setActiveTab("loans")}
            >
              Loan Applications
            </button>
            <button
              className={`admin-tab-trigger ${activeTab === "transfers" ? "active" : ""}`} // Renamed from admin-smt-tab-trigger
              onClick={() => setActiveTab("transfers")}
            >
              Transfers
            </button>
          </div>

          {activeTab === "customers" && (
            <div className="admin-tab-content"> {/* Renamed from admin-smt-tab-content */}
              <div className="admin-card"> {/* Renamed from admin-smt-card */}
                <div className="admin-card-header"> {/* Renamed from admin-smt-card-header */}
                  <h3 className="admin-card-title">Customer Accounts</h3> {/* Renamed from admin-smt-card-title */}
                  <p className="admin-card-description"> {/* Renamed from admin-smt-card-description */}
                    Manage and view all customer accounts
                  </p>
                </div>
                <div className="admin-card-content"> {/* Renamed from admin-smt-card-content */}
                  {loadingCustomers ? (
                    <p>Loading customers...</p>
                  ) : customers.length === 0 ? (
                    <p>No customer accounts found.</p>
                  ) : (
                    <div className="admin-table-container"> {/* Renamed from admin-smt-table-container */}
                      <table className="admin-table"> {/* Renamed from admin-smt-table */}
                        <thead className="admin-table-header"> {/* Renamed from admin-smt-table-header */}
                          <tr>
                            <th className="admin-table-head">Customer ID</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Name</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Email/Username</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Phone</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Status</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Balance</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Actions</th> {/* Renamed from admin-smt-table-head */}
                          </tr>
                        </thead>
                        <tbody className="admin-table-body"> {/* Renamed from admin-smt-table-body */}
                          {customers.map((customer) => (
                            <tr key={customer.customer_id} className="admin-table-row"> {/* Renamed from admin-smt-table-row */}
                              <td className="admin-table-cell admin-table-cell-bold"> {/* Renamed from admin-smt-table-cell admin-smt-table-cell-bold */}
                                {customer.customer_id.substring(0, 8)}...
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                {customer.first_name} {customer.last_name}
                              </td>
                              <td className="admin-table-cell">{customer.username}</td> {/* Renamed from admin-smt-table-cell */}
                              <td className="admin-table-cell">{customer.phone_no}</td> {/* Renamed from admin-smt-table-cell */}
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                <span
                                  className={`admin-badge ${getStatusClass( // Renamed from admin-smt-badge
                                    customer.account_status
                                  )}`}
                                >
                                  {customer.account_status}
                                </span>
                              </td>
                              <td className="admin-table-cell admin-table-cell-bold"> {/* Renamed from admin-smt-table-cell admin-smt-table-cell-bold */}
                                ${customer.balance?.toLocaleString()}
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                <button
                                  className="admin-btn admin-btn-ghost admin-action-button" // Renamed from admin-smt-btn admin-smt-btn-ghost admin-smt-action-button
                                  onClick={() => handleViewDetails('customer', customer.customer_id)}
                                >
                                  <Eye className="admin-action-icon" /> {/* Renamed from admin-smt-action-icon */}
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
            <div className="admin-tab-content"> {/* Renamed from admin-smt-tab-content */}
              <div className="admin-card"> {/* Renamed from admin-smt-card */}
                <div className="admin-card-header"> {/* Renamed from admin-smt-card-header */}
                  <h3 className="admin-card-title">Loan Applications</h3> {/* Renamed from admin-smt-card-title */}
                  <p className="admin-card-description"> {/* Renamed from admin-smt-card-description */}
                    Review and manage loan applications
                  </p>
                </div>
                <div className="admin-card-content"> {/* Renamed from admin-smt-card-content */}
                  {loadingLoanApplications ? (
                    <p>Loading loan applications...</p>
                  ) : loanApplications.length === 0 ? (
                    <p>No loan applications found.</p>
                  ) : (
                    <div className="admin-table-container"> {/* Renamed from admin-smt-table-container */}
                      <table className="admin-table"> {/* Renamed from admin-smt-table */}
                        <thead className="admin-table-header"> {/* Renamed from admin-smt-table-header */}
                          <tr>
                            <th className="admin-table-head">Application ID</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Customer</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Amount</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Intent</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Approval</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Date</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Actions</th> {/* Renamed from admin-smt-table-head */}
                          </tr>
                        </thead>
                        <tbody className="admin-table-body"> {/* Renamed from admin-smt-table-body */}
                          {loanApplications.map((loan) => (
                            <tr key={loan.loan_id} className="admin-table-row"> {/* Renamed from admin-smt-table-row */}
                              <td className="admin-table-cell admin-table-cell-bold"> {/* Renamed from admin-smt-table-cell admin-smt-table-cell-bold */}
                                {String(loan.loan_id).substring(0, 8)}...
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                {loan.customer_first_name} {loan.customer_last_name}
                              </td>
                              <td className="admin-table-cell admin-table-cell-bold"> {/* Renamed from admin-smt-table-cell admin-smt-table-cell-bold */}
                                ${loan.loan_amount?.toLocaleString()}
                              </td>
                              <td className="admin-table-cell">{loan.loan_intent}</td> {/* Renamed from admin-smt-table-cell */}
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                <span
                                  className={`admin-badge ${getStatusClass( // Renamed from admin-smt-badge
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
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                {loan.application_date}
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                <button
                                  className="admin-btn admin-btn-ghost admin-action-button" // Renamed from admin-smt-btn admin-smt-btn-ghost admin-smt-action-button
                                  onClick={() => handleViewDetails('loan', loan.loan_id)}
                                >
                                  <Eye className="admin-action-icon" /> {/* Renamed from admin-smt-action-icon */}
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
            <div className="admin-tab-content"> {/* Renamed from admin-smt-tab-content */}
              <div className="admin-card"> {/* Renamed from admin-smt-card */}
                <div className="admin-card-header"> {/* Renamed from admin-smt-card-header */}
                  <h3 className="admin-card-title">Transfers</h3> {/* Renamed from admin-smt-card-title */}
                  <p className="admin-card-description"> {/* Renamed from admin-smt-card-description */}
                    Monitor all transfer transactions
                  </p>
                </div>
                <div className="admin-card-content"> {/* Renamed from admin-smt-card-content */}
                  {loadingTransfers ? (
                    <p>Loading transfers...</p>
                  ) : transfers.length === 0 ? (
                    <p>No transfers found.</p>
                  ) : (
                    <div className="admin-table-container"> {/* Renamed from admin-smt-table-container */}
                      <table className="admin-table"> {/* Renamed from admin-smt-table */}
                        <thead className="admin-table-header"> {/* Renamed from admin-smt-table-header */}
                          <tr>
                            <th className="admin-table-head">Transfer ID</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">From Account</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">To Account</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Amount</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Type</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Date & Time</th> {/* Renamed from admin-smt-table-head */}
                            <th className="admin-table-head">Actions</th> {/* Renamed from admin-smt-table-head */}
                          </tr>
                        </thead>
                        <tbody className="admin-table-body"> {/* Renamed from admin-smt-table-body */}
                          {transfers.map((transfer) => (
                            <tr key={transfer.transaction_id} className="admin-table-row"> {/* Renamed from admin-smt-table-row */}
                              <td className="admin-table-cell admin-table-cell-bold"> {/* Renamed from admin-smt-table-cell admin-smt-table-cell-bold */}
                                {transfer.transaction_id.substring(0, 8)}...
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                {transfer.initiator_account_no}
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                {transfer.receiver_account_no}
                              </td>
                              <td className="admin-table-cell admin-table-cell-bold"> {/* Renamed from admin-smt-table-cell admin-smt-table-cell-bold */}
                                ${transfer.amount?.toLocaleString()}
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                <span
                                  className={`admin-badge ${getStatusClass( // Renamed from admin-smt-badge
                                    transfer.type_of_transfer
                                  )}`}
                                >
                                  {transfer.type_of_transfer}
                                </span>
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                {transfer.transfer_datetime}
                              </td>
                              <td className="admin-table-cell"> {/* Renamed from admin-smt-table-cell */}
                                <button
                                  className="admin-btn admin-btn-ghost admin-action-button" // Renamed from admin-smt-btn admin-smt-btn-ghost admin-smt-action-button
                                  onClick={() => handleViewDetails('transfer', transfer.transaction_id)}
                                >
                                  <Eye className="admin-action-icon" /> {/* Renamed from admin-smt-action-icon */}
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