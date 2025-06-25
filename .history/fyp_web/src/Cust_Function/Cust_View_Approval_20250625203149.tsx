import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../shared/Header.css'; // Assuming Header.css is available
import DarkModeToggle from '../shared/DarkModeToggle.tsx'; // Assuming DarkModeToggle is a separate component
import { Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';

// Define the Header component if not already defined globally or in a shared file
// It's good practice to have this in a separate file, e.g., src/components/Header.tsx
const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            // Navigate to the correct landing page after sign out
            navigate('/customer-landing');
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

// Interface for Loan Application data, matching Supabase schema fields for Loan table
interface LoanApplication {
    loan_id: string; // From Loan table
    loan_amount: number; // From Loan table
    loan_intent: string; // From Loan table (USER-DEFINED type loan_intent in schema)
    final_approval: boolean | null; // From Loan table (boolean, null for pending)
    application_date: string; // From Loan table (timestamp with time zone)
    customer_name: string; // Derived from Customer table join
}

// Interface for Customer Information (minimal for this page's needs)
interface CustomerInfo {
    customer_id: string | null;
    first_name: string;
    last_name: string;
}

const CustomerViewApproval: React.FC = () => {
    const navigate = useNavigate();
    const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        customer_id: null,
        first_name: '',
        last_name: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect hook to fetch user session and customer profile on component mount
    useEffect(() => {
        const fetchCustomerAndLoans = async () => {
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
                    setError('Customer profile not found.');
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
                    loan_id: loan.loan_id,
                    loan_amount: loan.loan_amount,
                    loan_intent: loan.loan_intent,
                    final_approval: loan.final_approval,
                    application_date: new Date(loan.application_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    customer_name: `${loan.Customer?.first_name || ''} ${loan.Customer?.last_name || ''}`.trim() || 'N/A',
                }));

                setLoanApplications(formattedLoans);

            } catch (err: any) {
                console.error("Initialization error:", err.message);
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerAndLoans();

        // Optional: Listen for auth state changes if needed to re-fetch or redirect
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                // If user logs out, clear data and redirect
                setCustomerInfo({ customer_id: null, first_name: '', last_name: '' });
                setLoanApplications([]);
                navigate('/customer-landing');
            } else {
                // If session changes (e.g., token refresh), re-fetch data
                fetchCustomerAndLoans();
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };

    }, [navigate]); // Add navigate to dependency array

    // Helper function to determine the CSS class for status badges
    const getStatusClass = (status: boolean | null) => {
        if (status === true) return "badge-success";
        if (status === false) return "badge-error";
        return "badge-warning"; // For null (pending)
    };

    if (loading) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="dashboard-container flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="ml-2 text-text">Loading loan applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-app-wrapper">
                <Header />
                <div className="dashboard-container">
                    <div className="card p-6 text-center">
                        <h2 className="text-xl font-semibold text-error-dark-text">Error</h2>
                        <p className="text-text-secondary mt-2">{error}</p>
                        <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-app-wrapper">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <Header />
            <div className="dashboard-container">
                <main className="dashboard-main container p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-text">
                            Loan Application Status
                        </h2>
                        <button
                            onClick={() => navigate('/customer-dashboard')}
                            className="btn btn-secondary"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title flex items-center">
                                <FileText className="mr-2" size={20} /> Your Loan Applications
                            </h3>
                            <p className="card-description">
                                Review the status of your submitted loan applications.
                            </p>
                        </div>
                        <div className="card-content">
                            {loanApplications.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead className="table-header">
                                            <tr>
                                                <th className="table-head">Application ID</th>
                                                <th className="table-head">Loan Amount</th>
                                                <th className="table-head">Loan Intent</th>
                                                <th className="table-head">Status</th>
                                                <th className="table-head">Application Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-body">
                                            {loanApplications.map((loan) => (
                                                <tr key={loan.loan_id} className="table-row">
                                                    <td className="table-cell table-cell-bold">
                                                        {loan.loan_id.substring(0, 8)}...
                                                    </td>
                                                    <td className="table-cell table-cell-bold">
                                                        ${loan.loan_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-text-secondary text-center py-4">
                                    No loan applications found.
                                </p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            {/* You might want a common footer here as well */}
        </div>
    );
};

export default CustomerViewApproval;
