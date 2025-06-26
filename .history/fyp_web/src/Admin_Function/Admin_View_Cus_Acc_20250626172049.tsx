// Admin_View_Cus_Acc.tsx

import React, { useState, useEffect } from 'react';
import "./AdminDashboard.module.css"; // CSS import
import { FaUser, FaBuildingColumns, FaMoneyBillTransfer, FaFileInvoiceDollar, FaRegTrashCan } from 'react-icons/fa6'; // Example icons
import { FaSearch } from 'react-icons/fa';
import supabase from '../supbaseClient.js';

interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  phone_no: string;
  email?: string;
  username: string;
  home_address: string;
  nationality: string;
  passport_no: string;
  ic_no: string;
  date_of_birth: string;
}

interface Account {
  account_id: string;
  account_no: string;
  account_type: string;
  balance: number;
  nickname: string;
  account_status: string;
}

const Admin_View_Cus_Acc: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerAccounts, setCustomerAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'accounts'>('details');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('Customer')
        .select('*');

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err.message);
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetailsAndAccounts = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveTab('details');
    setLoading(true);
    setError(null);
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('Account')
        .select('*')
        .eq('customer_id', customer.customer_id);

      if (accountsError) throw accountsError;
      setCustomerAccounts(accountsData || []);

    } catch (err: any) {
      console.error('Error fetching customer details or accounts:', err.message);
      setError('Failed to load customer details or accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.ic_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-smt-container">
      <header className={`admin-smt-main-content admin-smt-header-layout`}>
        <div className="admin-smt-brand-section">
          <div className="admin-smt-brand-logo"></div>
          <h1 className="admin-smt-brand-title">Admin Dashboard</h1>
        </div>
        <div className="admin-smt-header-right">
          {/* <div className="admin-smt-search-container">
            <FaSearch className="admin-smt-search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              className="admin-smt-search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div> */}
          <button className="admin-smt-sign-out-button">Sign Out</button>
        </div>
      </header>

      <main className="admin-smt-main-content">
        <h2>Customer Management</h2>

        {loading && <p>Loading customers...</p>}
        {error && <p className="admin-smt-badge-error">Error: {error}</p>}

        <div className={`admin-smt-tabs-container admin-smt-card admin-smt-mb-2`}>
          <h3 className="admin-smt-card-title">All Customers</h3>
          <div className="admin-smt-table-container">
            <table className="admin-smt-table">
              <thead className="admin-smt-table-header">
                <tr>
                  <th className="admin-smt-table-head">Name</th>
                  <th className="admin-smt-table-head">Username</th>
                  <th className="admin-smt-table-head">Phone No.</th>
                  <th className="admin-smt-table-head">IC No.</th>
                  <th className="admin-smt-table-head">Actions</th>
                </tr>
              </thead>
              <tbody className="admin-smt-table-body">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.customer_id} className="admin-smt-table-row">
                      <td className="admin-smt-table-cell">{customer.first_name} {customer.last_name}</td>
                      <td className="admin-smt-table-cell">{customer.username}</td>
                      <td className="admin-smt-table-cell">{customer.phone_no}</td>
                      <td className="admin-smt-table-cell">{customer.ic_no}</td>
                      <td className="admin-smt-table-cell">
                        <button
                          className="admin-smt-action-button"
                          onClick={() => fetchCustomerDetailsAndAccounts(customer)}
                          title="View Details"
                        >
                          {/* <FaUser className="admin-smt-action-icon" />  */}
                          <span className="sr-only">View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="admin-smt-table-row">
                    <td className="admin-smt-table-cell" colSpan={5}>No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedCustomer && (
          <div className={`admin-smt-tabs-container admin-smt-card admin-smt-mt-2`}>
            <div className="admin-smt-card-header">
              <h3 className="admin-smt-card-title">
                Details for {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h3>
            </div>
            <div className="admin-smt-tabs-list">
              <button
                className={`admin-smt-tab-trigger ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Customer Info
              </button>
              <button
                className={`admin-smt-tab-trigger ${activeTab === 'accounts' ? 'active' : ''}`}
                onClick={() => setActiveTab('accounts')}
              >
                Accounts ({customerAccounts.length})
              </button>
            </div>

            <div className="admin-smt-tab-content">
              {activeTab === 'details' && (
                <div>
                  <p><strong>Username:</strong> {selectedCustomer.username}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone_no}</p>
                  <p><strong>Passport No:</strong> {selectedCustomer.passport_no || 'N/A'}</p>
                  <p><strong>IC No:</strong> {selectedCustomer.ic_no || 'N/A'}</p>
                  <p><strong>Date of Birth:</strong> {selectedCustomer.date_of_birth}</p>
                  <p><strong>Nationality:</strong> {selectedCustomer.nationality}</p>
                  <p><strong>Home Address:</strong> {selectedCustomer.home_address}</p>
                </div>
              )}

              {activeTab === 'accounts' && (
                <div className="admin-smt-table-container">
                  <table className="admin-smt-table">
                    <thead className="admin-smt-table-header">
                      <tr>
                        <th className="admin-smt-table-head">Account No.</th>
                        <th className="admin-smt-table-head">Type</th>
                        <th className="admin-smt-table-head">Nickname</th>
                        <th className="admin-smt-table-head">Balance</th>
                        <th className="admin-smt-table-head">Status</th>
                        <th className="admin-smt-table-head">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="admin-smt-table-body">
                      {customerAccounts.length > 0 ? (
                        customerAccounts.map((account) => (
                          <tr key={account.account_id} className="admin-smt-table-row">
                            <td className="admin-smt-table-cell">{account.account_no}</td>
                            <td className="admin-smt-table-cell">{account.account_type}</td>
                            <td className="admin-smt-table-cell">{account.nickname || 'N/A'}</td>
                            <td className="admin-smt-table-cell">${account.balance.toFixed(2)}</td>
                            <td className="admin-smt-table-cell">
                              <span className={
                                account.account_status === 'Approved' ? "admin-smt-badge-success" :
                                account.account_status === 'Pending' ? "admin-smt-badge-warning" :
                                "admin-smt-badge-default"
                              }>
                                {account.account_status}
                              </span>
                            </td>
                            <td className="admin-smt-table-cell">
                               <button
                                className="admin-smt-action-button"
                                title="View Transactions"
                                onClick={() => alert(`View transactions for account: ${account.account_no}`)}
                               >
                                {/* <FaMoneyBillTransfer className="admin-smt-action-icon"/> */}
                                <span className="sr-only">View Transactions</span>
                               </button>
                               <button
                                className="admin-smt-action-button"
                                title="Delete Account"
                                onClick={() => alert(`Delete account: ${account.account_no}`)}
                               >
                                <FaRegTrashCan className="admin-smt-action-icon"/>
                                <span className="sr-only">Delete Account</span>
                               </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="admin-smt-table-row">
                          <td className="admin-smt-table-cell" colSpan={6}>No accounts found for this customer.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin_View_Cus_Acc;