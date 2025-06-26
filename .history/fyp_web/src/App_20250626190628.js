import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom'; 
import "./shared/Header.css" 
import Header from './shared/Header.tsx';

import Landing from './Landing/Landing.tsx';
import Register from './Landing/Register.tsx';
import Login from './Landing/Login.tsx';
import ForgotPassword from './Landing/Forgot_Password.tsx';

import AdminDashboard from './Dashboard/Admin_Dashboard.tsx';
import CustomerDashboard from './Dashboard/Customer_Dashboard.tsx';

import ReviewLoan from './Admin_Function/ReviewLoan.tsx';
import AdminApproveAcc from './Admin_Function/Admin_View_Cus_Acc.tsx';
import AdminTransferDetail from './Admin_Function/Admin_Transfer_Detail.tsx';
import AdminPassVer from './Admin_Function/Admin_Pass_Ver.tsx';

import CustomerTransfer from './Cust_Function/Cust_Transfer.tsx';
import CustomerTransferConfirmation from './Cust_Function/Cust_Transfer_Confirmation.tsx';
import CustomerTransferComplete from './Cust_Function/Cust_Transfer_Complete.tsx';
import CustomerNewBankAcc from './Cust_Function/Cust_New_Bank_Acc.tsx';
import CustomerAccSuccess from './Cust_Function/Cust_New_Acc_Success.tsx';
import CustomerAccDetail from './Cust_Function/Cust_Acc_Detail.tsx';
import CustomerLoanApply from './Cust_Function/Cust_Apply_Loan.tsx';
import CustomerViewApproval from './Cust_Function/Cust_View_Approval.tsx';

import CustomerTransactionsHistory from './Cust_Function/Cust_Transfer_History.tsx';
import CustomerProfileEdit from './Cust_Function/Cust_Profile_Edit.tsx';
import CustomerPassVer from './Cust_Function/Cust_Pass_Ver.tsx';

const AppLayout = () => {
  const location = useLocation();

  const showBackButton = ![
    '/', // Landing page
    '/admin-dashboard',
    '/customer-dashboard',
    '/customer-new-account-success'
  ].includes(location.pathname);

  const backPath = showBackButton ? '/' : '';

  const showSignOutButton = ![
    '/', // Landing
    '/register',
    '/login',
    '/forgot-password',
  ].includes(location.pathname);

  return (
    <>
      <Header showBackButton={showBackButton} showSignOutButton={showSignOutButton} />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes that should NOT have the Header */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<AppLayout />}>
          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/loan/:loanId" element={<ReviewLoan />} />
          <Route path="/admin-approve-account/:customerId" element={<AdminApproveAcc />} />
          <Route path="/admin/transfer/:transferId" element={<AdminTransferDetail />} />
          <Route path="/admin-approve-account" element={<AdminApproveAcc />} />
          <Route path="/admin-review-loan" element={<ReviewLoan />} />
          <Route path="/admin-password-verification" element={<AdminPassVer />} />

          {/* Customer Dashboard & Functions */}
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/customer-transfer" element={<CustomerTransfer />} />
          <Route path="/customer-transfer-confirmation" element={<CustomerTransferConfirmation />} />
          <Route path="/customer-transfer-complete" element={<CustomerTransferComplete />} />
          <Route path="/customer-new-bank-account" element={<CustomerNewBankAcc />} />
          <Route path="/customer-new-account-success" element={<CustomerAccSuccess />} />
          <Route path="/customer-account-details/:accountId" element={<CustomerAccDetail />} />
          <Route path="/customer-apply-loan" element={<CustomerLoanApply />} />
          <Route path="/customer-view-approval" element={<CustomerViewApproval />} />
          <Route path="/customer-transactions-history" element={<CustomerTransactionsHistory />} />
          <Route path="/customer-profile-edit" element={<CustomerProfileEdit />} />
          <Route path="/customer-password-verification" element={<CustomerPassVer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;