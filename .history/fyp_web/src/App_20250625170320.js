import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './Login/Forgot_Password.tsx';
import UpdatePassword from './Login/Update_Password.tsx';

import AdminRegister from './Login/Admin_Register.tsx';
import AdminDashboard from './Dashboard/Admin_Dashboard.tsx';
import ReviewLoan from './Admin_Function/ReviewLoan.tsx';
import AdminApproveAcc from './Admin_Function/Admin_Approve_Acc.tsx';
import AdminPassVer from './Admin_Function/Admin_Pass_Ver.tsx';

import CustomerLanding from './Login/Landing.tsx';
import CustomerRegister from './Login/Cus_Register.tsx';
import CustomerLogin from './Login/Login.tsx';
import CustomerDashboard from './Dashboard/Customer_Dashboard.tsx';
import CustomerTransfer from './Cust_Function/Cust_Transfer.tsx';
import CustomerTransferConfirmation from './Cust_Function/Cust_Transfer_Confimation.tsx';
import CustomerTransferComplete from './Cust_Function/Cust_Transfer_Complete.tsx';
import { CustomerNewBankAcc } from './Cust_Function/Cust_New_Bank_Acc.tsx';
import CustomerAccSuccess from './Cust_Function/Cust_New_Acc_Success.tsx';
import CustomerAccDetail from './Cust_Function/Cust_Acc_Detail.tsx';
import CustomerLoanApply from './Cust_Function/Cust_Apply_Loan.tsx';
import CustomerViewApproval from './Cust_Function/Cust_View_Approval.tsx';
import CustomerTransactionsHistory from './Cust_Function/Cust_Tran_Hist.tsx';
import CustomerProfileEdit from './Cust_Function/Cust_Profile_Edit.tsx';
import CustomerPassVer from './Cust_Function/Cust_Pass_Ver.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/review-loan" element={<ReviewLoan />} />
        <Route path="/admin/approve-account" element={<AdminApproveAcc />} />
        <Route path="/admin/password-verification" element={<AdminPassVer />} />

        {/* Customer Login & Landing */}
        <Route path="/" element={<CustomerLanding />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/customer/login" element={<CustomerLogin />} />

        {/* Customer Dashboard & Functions */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/transfer" element={<CustomerTransfer />} />
        <Route path="/customer/transfer-confirmation" element={<CustomerTransferConfirmation />} />
        <Route path="/customer/transfer-complete" element={<CustomerTransferComplete />} />
        <Route path="/customer/new-bank-account" element={<CustomerNewBankAcc />} />
        <Route path="/customer/new-account-success" element={<CustomerAccSuccess />} />
        <Route path="/customer/account-detail" element={<CustomerAccDetail />} />
        <Route path="/customer/apply-loan" element={<CustomerLoanApply />} />
        <Route path="/customer/view-approval" element={<CustomerViewApproval />} />
        <Route path="/customer/transactions-history" element={<CustomerTransactionsHistory />} />
        <Route path="/customer/profile-edit" element={<CustomerProfileEdit />} />
        <Route path="/customer/password-verification" element={<CustomerPassVer />} />

        {/* Password Reset */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
