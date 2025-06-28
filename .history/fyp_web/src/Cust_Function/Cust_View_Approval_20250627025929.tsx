import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient.js';
import { Loader2, CheckCircle, XCircle, FileText, Banknote } from 'lucide-react'; // Added Banknote icon

// Interface for Loan Application data, matching Supabase schema fields for Loan table
interface LoanApplication {
    loan_id: string; // From Loan table
    loan_amount: number; // From Loan table
    loan_intent: string; // From Loan table (USER-DEFINED type loan_intent in schema)
    final_approval: boolean | null; // From Loan table (boolean, null for pending)
    application_date: string; // From Loan table (timestamp with time zone)
    customer_name: string; // Derived from Customer table join
}

// Interface for Bank Account Application (Placeholder structure for now)
interface BankAccountApplication {
    account_id: string; // Unique ID for the account application
    account_type: string; // e.g., "Savings", "Checking"
    application_date: string;
    status: 'Pending' | 'Approved' | 'Rejected'; // Simplified status
}

// Interface for Customer Information (minimal for this page's needs)
interface CustomerInfo {
    customer_id: string | null;
    first_name: string;
    last_name: string;
}

const Cust_View_Approval: React.FC = () => {
    const navigate = useNavigate();
    const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
    // Placeholder state for bank account applications
    const [bankAccountApplications, setBankAccountApplications] = useState<BankAccountApplication[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        customer_id: null,
        first_name: '',
        last_name: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect hook to fetch user session and customer profile on component mount
    useEffect(() => {
        const fetchCustomerAndApplications = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Get current user session
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw new Error(`Session error: ${sessionError.message}`);
                }
                if (!sessionData?.session) {
                    // No session found, redirect to login
                    navigate('/customer-landing');
                    return;
                }

                const userUuid = sessionData.session.user.id;

                // 2. Fetch customer_id using user_uuid
                const { data: customerData, error: customerError } = await supabase
                    .from('Customer')
                    .select('customer_id, first_name, last_name')
                    .eq('user_uuid', userUuid)
                    .single();

                if (customerError) {
                    throw new Error(`Error fetching customer profile: ${customerError.message}`);
                }
                if (!customerData) {
                    setError('Customer profile not found. Please ensure your profile is complete.');
                    setLoading(false);
                    return;
                }

                setCustomerInfo({
                    customer_id: customerData.customer_id,
                    first_name: customerData.first_name,
                    last_name: customerData.last_name,
                });

                // 3. Fetch loan applications for this customer
                const { data: loansData, error: loansError } = await supabase
                    .from('Loan')
                    .select(`
                        loan_id,
                        loan_amount,
                        loan_intent,
                        final_approval,
                        application_date,
                        Customer (first_name, last_name)
                    `)
                    .eq('customer_id', customerData.customer_id)
                    .order('application_date', { ascending: false });

                if (loansError) {
                    throw new Error(`Error fetching loan applications: ${loansError.message}`);
                }

                const formattedLoans: LoanApplication[] = (loansData || []).map((loan: any) => ({
                    loan_id: String(loan.loan_id),
                    loan_amount: loan.loan_amount,
                    loan_intent: loan.loan_intent,
                    final_approval: loan.final_approval,
                    application_date: new Date(loan.application_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    customer_name: `${loan.Customer?.first_name || ''} ${loan.Customer?.last_name || ''}`.trim() || 'N/A',
                }));

                setLoanApplications(formattedLoans);


                setBankAccountApplications(mockBankAccountApps); // Replace with actual Supabase fetch if applicable

            } catch (err: any) {
                console.error("Initialization error:", err.message);
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerAndApplications();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                setCustomerInfo({ customer_id: null, first_name: '', last_name: '' });
                setLoanApplications([]);
                setBankAccountApplications([]); // Clear bank account data on logout
                navigate('/customer-landing');
            } else {
                fetchCustomerAndApplications();
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };

    }, [navigate]);

    // Helper function to determine the CSS class for status badges for loans
    const getLoanStatusClass = (status: boolean | null) => {
        if (status === true) return "cf-badge-success";
        if (status === false) return "cf-badge-error";
        return "cf-badge-warning"; // For null (pending)
    };

    // Helper function to determine the CSS class for status badges for bank accounts
    const getBankAccountStatusClass = (status: 'Pending' | 'Approved' | 'Rejected') => {
        if (status === 'Approved') return "cf-badge-success";
        if (status === 'Rejected') return "cf-badge-error";
        return "cf-badge-warning"; // For pending
    };

    if (loading) {
        return (
            <div className="cf-main-app-wrapper">
                <div className="cf-cust-func-container flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <Loader2 className="animate-spin text-cf-blue-accent" size={32} />
                    <p className="ml-2 text-cf-text-primary">Loading your applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cf-main-app-wrapper">
                <div className="cf-cust-func-container">
                    <div className="cf-cust-func-card p-6 text-center">
                        <h2 className="cf-cust-func-card-title text-cf-red-error">Error</h2>
                        <p className="cf-cust-func-text-secondary mt-2">{error}</p>
                        <button onClick={() => window.location.reload()} className="cf-cust-func-primary-button mt-4">
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cf-main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <div className="cf-cust-func-container">
                <main className="cf-cust-func-content p-6">
                    {/* --- Bank Account Applications Section --- */}
                    <div className="cf-cust-func-card mb-6">
                        <div className="cf-cust-func-card-header">
                            <h3 className="cf-cust-func-card-title flex items-center">
                                <Banknote className="mr-2" size={24} /> Bank Account Applications
                            </h3>
                            <p className="cf-text-secondary">
                                Review the status of your submitted bank account applications.
                            </p>
                        </div>
                        <div className="cf-cust-func-card-content">
                            {bankAccountApplications.length > 0 ? (
                                <div className="cf-table-container">
                                    <table className="cf-table">
                                        <thead className="cf-table-header">
                                            <tr>
                                                <th className="cf-table-head">Application ID</th>
                                                <th className="cf-table-head">Account Type</th>
                                                <th className="cf-table-head">Application Date</th>
                                                <th className="cf-table-head">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cf-table-body">
                                            {bankAccountApplications.map((app) => (
                                                <tr key={app.account_id} className="cf-table-row">
                                                    <td className="cf-table-cell cf-table-cell-bold">
                                                        {app.account_id}
                                                    </td>
                                                    <td className="cf-table-cell">{app.account_type}</td>
                                                    <td className="cf-table-cell">{app.application_date}</td>
                                                    <td className="cf-table-cell">
                                                        <span
                                                            className={`cf-badge ${getBankAccountStatusClass(
                                                                app.status
                                                            )}`}
                                                        >
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="cf-text-secondary cf-text-center cf-py-4">
                                    No bank account applications found.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* --- Loan Applications Section --- */}
                    <div className="cf-cust-func-card">
                        <div className="cf-cust-func-card-header">
                            <h3 className="cf-cust-func-card-title flex items-center">
                                <FileText className="mr-2" size={24} /> Loan Applications
                            </h3>
                            <p className="cf-text-secondary">
                                Review the status of your submitted loan applications.
                            </p>
                        </div>
                        <div className="cf-cust-func-card-content">
                            {loanApplications.length > 0 ? (
                                <div className="cf-table-container">
                                    <table className="cf-table">
                                        <thead className="cf-table-header">
                                            <tr>
                                                <th className="cf-table-head">Application ID</th>
                                                <th className="cf-table-head">Loan Amount</th>
                                                <th className="cf-table-head">Loan Intent</th>
                                                <th className="cf-table-head">Status</th>
                                                <th className="cf-table-head">Application Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cf-table-body">
                                            {loanApplications.map((loan) => (
                                                <tr key={loan.loan_id} className="cf-table-row">
                                                    <td className="cf-table-cell cf-table-cell-bold">
                                                        {loan.loan_id.substring(0, 8)}...
                                                    </td>
                                                    <td className="cf-table-cell cf-table-cell-bold">
                                                        ${loan.loan_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="cf-table-cell">{loan.loan_intent}</td>
                                                    <td className="cf-table-cell">
                                                        <span
                                                            className={`cf-badge ${getLoanStatusClass(
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
                                                    <td className="cf-table-cell">
                                                        {loan.application_date}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="cf-text-secondary cf-text-center cf-py-4">
                                    No loan applications found.
                                </p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Cust_View_Approval;