import React, { useState, useEffect, createContext, useContext } from 'react';

// Mock Supabase client for Canvas environment
// In a real application, you would import your actual Supabase client:
// import supabase from '../supabaseClient.js';
const supabase = {
    auth: {
        signOut: async () => {
            console.log("Mock Supabase: User signed out.");
            return { error: null };
        },
        getSession: async () => ({ data: { session: null }, error: null })
    },
    from: (tableName: string) => ({
        select: (columns: string) => ({
            eq: (column: string, value: any) => ({
                single: async () => {
                    console.log(`Mock Supabase: Fetching from ${tableName} where ${column} = ${value} with columns: ${columns}`);
                    if (tableName === 'Customer' && value === 'mock-customer-123') {
                        return {
                            data: {
                                customer_id: 'mock-customer-123',
                                first_name: 'John',
                                last_name: 'Doe',
                                phone_no: '+1234567890',
                                username: 'john.doe@example.com',
                                created_at: '2023-01-15T10:00:00Z',
                                Account: [
                                    {
                                        account_id: 'acc-001',
                                        customer_id: 'mock-customer-123',
                                        account_no: '1234567890',
                                        account_type: 'Savings',
                                        balance: 1500.75,
                                        account_status: 'Active',
                                        created_at: '2023-01-20T11:00:00Z',
                                        nickname: 'Main Savings',
                                        approved_at: '2023-01-21T10:00:00Z',
                                        favourite_accounts: null,
                                    },
                                    {
                                        account_id: 'acc-002',
                                        customer_id: 'mock-customer-123',
                                        account_no: '0987654321',
                                        account_type: 'Checking',
                                        balance: 500.20,
                                        account_status: 'Pending',
                                        created_at: '2023-02-01T09:00:00Z',
                                        nickname: null,
                                        approved_at: null,
                                        favourite_accounts: null,
                                    },
                                    {
                                        account_id: 'acc-003',
                                        customer_id: 'mock-customer-123',
                                        account_no: '1122334455',
                                        account_type: 'Loan',
                                        balance: -5000.00,
                                        account_status: 'Rejected',
                                        created_at: '2023-03-10T14:30:00Z',
                                        nickname: 'Car Loan',
                                        approved_at: null,
                                        favourite_accounts: null,
                                    },
                                ]
                            },
                            error: null
                        };
                    }
                    return { data: null, error: { message: `${tableName} not found (mock data).` } };
                }
            }),
        }),
        update: (updates: any) => ({
            eq: (column: string, value: any) => ({
                select: async () => {
                    console.log(`Mock Supabase: Updating ${column} = ${value} with:`, updates);
                    return {
                        data: [{ ...updates, [column]: value }],
                        error: null
                    };
                }
            })
        }),
        delete: () => ({
            eq: (column: string, value: any) => ({
                async then(resolve: (value: any) => void, reject: (reason?: any) => void) {
                    console.log(`Mock Supabase: Deleting from Customer where ${column} = ${value}`);
                    if (value === 'mock-customer-123') {
                        resolve({ data: null, error: null });
                    } else {
                        reject({ error: { message: "Mock deletion failed for unknown customer ID." } });
                    }
                }
            })
        })
    })
};

// Import the consolidated AdminFunction.css
import './AdminFunction.css';

// --- Context for Navigation and Params (for Canvas environment) ---
const NavigationContext = createContext<{ navigate: (path: string) => void; params: { [key: string]: any } }>({
    navigate: (path) => console.log(`Navigating to: ${path}`),
    params: {},
});

const NavigationProvider = ({ children, initialPath = '/admin-dashboard' }: { children: React.ReactNode; initialPath?: string }) => {
    const [path, setPath] = useState(initialPath);
    const [params, setParams] = useState<{ [key: string]: any }>({});

    const navigate = (newPath: string) => {
        setPath(newPath);
        const customerMatch = newPath.match(/^\/customer-details\/(.*)$/);
        if (customerMatch && customerMatch[1]) {
            setParams({ customerId: customerMatch[1] });
        } else {
            setParams({});
        }
    };

    return (
        <NavigationContext.Provider value={{ navigate, params }}>
            {children}
        </NavigationContext.Provider>
    );
};

const useNavigate = () => useContext(NavigationContext).navigate;
const useParams = () => useContext(NavigationContext).params;

// --- Lucide Icons (Inline SVG to avoid external dependencies in Canvas) ---
interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    className?: string;
}

const CheckCircle: React.FC<LucideIconProps> = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-check-circle ${className}`} {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
    </svg>
);

const XCircle: React.FC<LucideIconProps> = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-x-circle ${className}`} {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);

const Loader2: React.FC<LucideIconProps> = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-loader-2 ${className}`} {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const User: React.FC<LucideIconProps> = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-user ${className}`} {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const FileText: React.FC<LucideIconProps> = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-file-text ${className}`} {...props}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
    </svg>
);

const ArrowLeft: React.FC<LucideIconProps> = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-arrow-left ${className}`} {...props}>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const Trash2: React.FC<LucideIconProps> = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-trash-2 ${className}`} {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
);


// --- DarkModeToggle Component (Dummy) ---
const DarkModeToggle: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-background-light dark:bg-background-dark text-text-secondary dark:text-text-primary hover:bg-primary-light dark:hover:bg-primary-dark transition-colors duration-200"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 4a1 1 0 011 1v1a1 1 0 11-2 0V7a1 1 0 011-1zm-4 8a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4-4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm5.325-9.166a.25.25 0 00-.256-.277c-.544.11-1.07.31-1.57.593A7.942 7.942 0 0010 4C5.582 4 2 7.582 2 12s3.582 8 8 8 8-3.582 8-8c0-1.789-.595-3.442-1.603-4.757a.25.25 0 00-.277-.256zM10 6a6 6 0 100 12 6 6 0 000-12z" clipRule="evenodd" />
                </svg>
            )}
        </button>
    );
};

// --- Header Component ---
const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/customer-landing');
        }
    };

    return (
        <header className="header">
            <div className="header__content">
                <div className="logo-section">
                    <h1 className="logo-text">Eminent Western</h1>
                </div>
                <nav className="header-nav"></nav>
                <div className="header-actions">
                    <DarkModeToggle />
                    <button
                        onClick={handleSignOut}
                        className="admin-smt-sign-out-button header-sign-out-btn"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};

// --- Interface Definitions ---
type AccountType = 'Savings' | 'Checking' | 'Loan' | string;
type AccountStatus = 'Pending' | 'Active' | 'Inactive' | 'Rejected' | string;

interface Account {
    account_id: string;
    customer_id: string;
    account_no: string;
    account_type: AccountType;
    balance: number;
    account_status: AccountStatus;
    created_at: string;
    nickname: string | null;
    approved_at: string | null;
    favourite_accounts: any[] | null;
}

interface CustomerDetails {
    customer_id: string;
    first_name: string;
    last_name: string;
    phone_no: string;
    username: string;
    created_at: string;
    Account: Account[];
}

// --- CustomerDetailsPage Component ---
const CustomerDetailsPage: React.FC = () => {
    const { customerId } = useParams<{ customerId?: string }>(); // Make customerId optional for initial render
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            setLoading(true);
            setError(null);
            setCustomer(null);

            const currentCustomerId = customerId || 'mock-customer-123'; // Fallback for demo

            if (!currentCustomerId) {
                setError("Customer ID is missing from the URL.");
                setLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabase
                    .from('Customer')
                    .select(`
                        customer_id,
                        first_name,
                        last_name,
                        phone_no,
                        username,
                        created_at,
                        Account (
                            account_id,
                            account_no,
                            account_type,
                            balance,
                            account_status,
                            created_at,
                            nickname,
                            approved_at,
                            favourite_accounts
                        )
                    `)
                    .eq('customer_id', currentCustomerId)
                    .single();

                if (fetchError) {
                    throw fetchError;
                }

                if (data) {
                    setCustomer(data as CustomerDetails);
                } else {
                    setError("Customer not found with the provided ID.");
                }
            } catch (err: any) {
                console.error("Error fetching customer details:", err.message);
                setError(`Failed to load customer details: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerDetails();
    }, [customerId]);

    const handleAccountStatusUpdate = async (accountId: string, newStatus: AccountStatus) => {
        setIsUpdating(true);
        setUpdateMessage(null);

        try {
            const { data, error: updateError } = await supabase
                .from('Account')
                .update({
                    account_status: newStatus,
                    approved_at: newStatus === 'Active' ? new Date().toISOString() : null,
                })
                .eq('account_id', accountId)
                .select();

            if (updateError) {
                throw updateError;
            }

            if (data && data.length > 0) {
                setUpdateMessage(`Account ${data[0].account_no} status updated to ${newStatus}.`);
                setCustomer(prevCustomer => {
                    if (!prevCustomer) return null;
                    return {
                        ...prevCustomer,
                        Account: prevCustomer.Account.map(acc =>
                            acc.account_id === accountId
                                ? {
                                    ...acc,
                                    account_status: newStatus,
                                    approved_at: newStatus === 'Active' ? new Date().toISOString() : null
                                }
                                : acc
                        ),
                    };
                });
            } else {
                setUpdateMessage("No account found to update or no changes were made.");
            }
        } catch (err: any) {
            console.error("Error updating account status:", err.message);
            setUpdateMessage(`Failed to update account status: ${err.message}`);
        } finally {
            setIsUpdating(false);
            setTimeout(() => setUpdateMessage(null), 3000);
        }
    };

    const handleDeleteCustomer = async () => {
        setIsDeleting(true);
        setUpdateMessage(null);
        setShowDeleteConfirm(false);

        const idToDelete = customerId || 'mock-customer-123';

        if (!idToDelete) {
            setUpdateMessage("Cannot delete: Customer ID is missing.");
            setIsDeleting(false);
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('Customer')
                .delete()
                .eq('customer_id', idToDelete);

            if (deleteError) {
                throw deleteError;
            }

            setUpdateMessage(`Customer ${idToDelete} successfully deleted.`);
            setTimeout(() => navigate('/admin-dashboard'), 1500);

        } catch (err: any) {
            console.error("Error deleting customer:", err.message);
            setUpdateMessage(`Failed to delete customer: ${err.message}`);
        } finally {
            setIsDeleting(false);
            setTimeout(() => setUpdateMessage(null), 3000);
        }
    };

    // Updated getStatusClass to use AdminFunction.css badge classes
    const getStatusClassForBadge = (status: string | boolean | null) => {
        if (typeof status === "boolean") {
            return status ? "admin-smt-badge-success" : "admin-smt-badge-error";
        }
        switch (String(status).toLowerCase()) {
            case "active":
            case "approved":
                return "admin-smt-badge-success";
            case "pending":
            case "under review":
            case "null":
                return "admin-smt-badge-warning";
            case "inactive":
            case "rejected":
            case "failed":
                return "admin-smt-badge-error";
            default:
                return "admin-smt-badge-default";
        }
    };

    if (loading) {
        return (
            <div className="admin-smt-container loading">
                <Header />
                <main className="admin-smt-main-content flex items-center justify-center">
                    <Loader2 className="admin-smt-stat-icon animate-spin" size={32} />
                    <p className="ml-2">Loading customer details...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-smt-container error-message">
                <Header />
                <main className="admin-smt-main-content flex items-center justify-center">
                    <div className="admin-smt-card text-center max-w-md w-full">
                        <h2 className="admin-smt-card-title text-error-dark-text">Error</h2>
                        <p className="admin-smt-stat-description mt-2">{error}</p>
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="admin-smt-btn admin-smt-btn-primary mt-4"
                        >
                            Go back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="admin-smt-container no-data">
                <Header />
                <main className="admin-smt-main-content flex items-center justify-center">
                    <div className="admin-smt-card text-center max-w-md w-full">
                        <h2 className="admin-smt-card-title">Customer Not Found</h2>
                        <p className="admin-smt-stat-description mt-2">The customer with ID "{customerId}" could not be found.</p>
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="admin-smt-btn admin-smt-btn-primary mt-4"
                        >
                            Go back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-smt-container">
            <Header />
            <main className="admin-smt-main-content">
                <div className="relative flex items-center justify-center mb-6">
                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="admin-smt-btn admin-smt-btn-ghost absolute left-0 flex items-center group"
                        title="Back to Dashboard"
                        disabled={isDeleting || isUpdating}
                    >
                        <ArrowLeft className="admin-smt-action-icon mr-2 group-hover:translate-x-[-2px] transition-transform duration-200" size={20} />
                        <span className="font-semibold">Back</span>
                    </button>
                    <h2 className="page-title flex-grow">Customer Details</h2>
                </div>

                {updateMessage && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center justify-between text-base font-medium transition-opacity duration-300 ${updateMessage.includes('Failed') ? 'admin-smt-badge-error' : 'admin-smt-badge-success'}`}>
                        <span>{updateMessage}</span>
                        <button onClick={() => setUpdateMessage(null)} className="admin-smt-btn-ghost p-1 rounded-full">
                            <XCircle size={20} className="inline-block" />
                        </button>
                    </div>
                )}

                <div className="admin-smt-stats-grid"> {/* Re-using stats-grid for layout */}
                    {/* Customer Information Card */}
                    <div className="admin-smt-card flex flex-col">
                        <div className="admin-smt-card-header mb-4 pb-4 border-b border-border-light dark:border-border-dark">
                            <div className="flex items-center">
                                <User className="admin-smt-stat-icon mr-3" size={24} />
                                <h3 className="admin-smt-card-title">Customer Information</h3>
                            </div>
                        </div>
                        <div className="detail-grid flex-grow">
                            <div className="detail-group">
                                <p className="detail-label">Customer ID:</p>
                                <p className="detail-value break-all">{customer.customer_id}</p>
                            </div>
                            <div className="detail-group">
                                <p className="detail-label">Name:</p>
                                <p className="detail-value">{customer.first_name} {customer.last_name}</p>
                            </div>
                            <div className="detail-group">
                                <p className="detail-label">Email/Username:</p>
                                <p className="detail-value break-all">{customer.username}</p>
                            </div>
                            <div className="detail-group">
                                <p className="detail-label">Phone Number:</p>
                                <p className="detail-value">{customer.phone_no}</p>
                            </div>
                            <div className="detail-group">
                                <p className="detail-label">Member Since:</p>
                                <p className="detail-value">{new Date(customer.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark flex justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="admin-smt-btn reject-button flex items-center"
                                disabled={isDeleting || isUpdating}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} /> Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2" size={16} /> Delete Customer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Account Details Card */}
                    <div className="admin-smt-card col-span-1 lg:col-span-2">
                        <div className="admin-smt-card-header mb-4 pb-4 border-b border-border-light dark:border-border-dark">
                            <div className="flex items-center">
                                <FileText className="admin-smt-stat-icon mr-3" size={24} />
                                <h3 className="admin-smt-card-title">Linked Accounts</h3>
                            </div>
                        </div>
                        <div className="admin-smt-table-container">
                            {customer.Account && customer.Account.length > 0 ? (
                                <table className="admin-smt-table">
                                    <thead className="admin-smt-table-header">
                                        <tr>
                                            <th scope="col" className="admin-smt-table-head rounded-tl-lg">Account No.</th>
                                            <th scope="col" className="admin-smt-table-head">Type</th>
                                            <th scope="col" className="admin-smt-table-head">Balance</th>
                                            <th scope="col" className="admin-smt-table-head">Nickname</th>
                                            <th scope="col" className="admin-smt-table-head">Status</th>
                                            <th scope="col" className="admin-smt-table-head">Created On</th>
                                            <th scope="col" className="admin-smt-table-head">Approved On</th>
                                            <th scope="col" className="admin-smt-table-head rounded-tr-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="admin-smt-table-body">
                                        {customer.Account.map((account) => (
                                            <tr key={account.account_id} className="admin-smt-table-row">
                                                <td className="admin-smt-table-cell admin-smt-table-cell-bold">{account.account_no}</td>
                                                <td className="admin-smt-table-cell">{account.account_type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-dark">${account.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="admin-smt-table-cell">{account.nickname || 'N/A'}</td>
                                                <td className="admin-smt-table-cell">
                                                    <span className={`admin-smt-badge ${getStatusClassForBadge(account.account_status)}`}>
                                                        {account.account_status}
                                                    </span>
                                                </td>
                                                <td className="admin-smt-table-cell">
                                                    {new Date(account.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="admin-smt-table-cell">
                                                    {account.approved_at ? new Date(account.approved_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="admin-smt-table-cell text-right">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        {account.account_status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    className="admin-smt-btn admin-smt-btn-primary flex items-center justify-center"
                                                                    onClick={() => handleAccountStatusUpdate(account.account_id, 'Active')}
                                                                    disabled={isUpdating || isDeleting}
                                                                    title="Approve Account"
                                                                >
                                                                    <CheckCircle size={16} className="mr-1" /> Approve
                                                                </button>
                                                                <button
                                                                    className="admin-smt-btn reject-button flex items-center justify-center"
                                                                    onClick={() => handleAccountStatusUpdate(account.account_id, 'Rejected')}
                                                                    disabled={isUpdating || isDeleting}
                                                                    title="Reject Account"
                                                                >
                                                                    <XCircle size={16} className="mr-1" /> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {(account.account_status === 'Active' || account.account_status === 'Rejected') && (
                                                            <button
                                                                className="admin-smt-btn admin-smt-btn-ghost flex items-center justify-center"
                                                                onClick={() => handleAccountStatusUpdate(account.account_id, 'Pending')}
                                                                disabled={isUpdating || isDeleting}
                                                                title="Reset Account Status to Pending"
                                                            >
                                                                Reset to Pending
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-text-secondary dark:text-text-dark-secondary text-center py-8">No accounts linked to this customer.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="prediction-modal-overlay"> {/* Re-using modal overlay class */}
                    <div className="prediction-modal-content text-center"> {/* Re-using modal content class */}
                        <XCircle size={32} className="text-error-light mx-auto mb-4" />
                        <h3 className="prediction-modal-title">Confirm Deletion</h3>
                        <p className="prediction-loading-text mb-6">
                            Are you sure you want to delete customer <span className="font-semibold">{customer?.first_name} {customer?.last_name}</span> (ID: {customer?.customer_id})?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="admin-smt-btn admin-smt-btn-ghost"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCustomer}
                                className="admin-smt-btn reject-button"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 inline-block" size={16} /> Deleting...
                                    </>
                                ) : (
                                    'Confirm Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App Component (Routing Simulation) ---
const App = () => {
    // Initial route could be admin-dashboard or customer-details/mock-customer-123
    const [currentPath, setCurrentPath] = useState('/customer-details/mock-customer-123'); // Default to showing customer details

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        setCurrentPath(path);
    };

    const getRouteComponent = () => {
        if (currentPath.startsWith('/customer-details/')) {
            return <CustomerDetailsPage />;
        } else if (currentPath === '/admin-dashboard' || currentPath === '/') {
            return (
                <div className="admin-smt-container">
                    <Header />
                    <main className="admin-smt-main-content flex items-center justify-center">
                        <div className="admin-smt-card text-center max-w-md w-full">
                            <h2 className="admin-smt-card-title">Admin Dashboard</h2>
                            <p className="admin-smt-stat-description mb-6">
                                This is a placeholder for the admin dashboard.
                                Click the button below to view mock customer details.
                            </p>
                            <button
                                onClick={() => navigate('/customer-details/mock-customer-123')}
                                className="admin-smt-btn admin-smt-btn-primary"
                            >
                                View Mock Customer Details
                            </button>
                            <p className="admin-smt-stat-description mt-4">
                                (Customer ID for mock data: mock-customer-123)
                            </p>
                        </div>
                    </main>
                </div>
            );
        } else if (currentPath === '/customer-landing') {
            return (
                <div className="admin-smt-container">
                    <Header />
                    <main className="admin-smt-main-content flex items-center justify-center">
                        <div className="admin-smt-card text-center max-w-md w-full">
                            <h2 className="admin-smt-card-title">Customer Landing Page</h2>
                            <p className="admin-smt-stat-description mb-6">
                                You have successfully signed out. This is a placeholder for the customer landing page.
                            </p>
                            <button
                                onClick={() => navigate('/admin-dashboard')}
                                className="admin-smt-btn admin-smt-btn-primary"
                            >
                                Go to Admin Dashboard (Sign In)
                            </button>
                        </div>
                    </main>
                </div>
            );
        }
        return (
            <div className="admin-smt-container">
                <Header />
                <main className="admin-smt-main-content flex items-center justify-center">
                    <div className="admin-smt-card text-center max-w-md w-full">
                        <h2 className="admin-smt-card-title admin-smt-badge-error">404 - Page Not Found</h2>
                        <p className="admin-smt-stat-description mb-6">
                            The requested page does not exist.
                        </p>
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="admin-smt-btn admin-smt-btn-primary"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    };

    return (
        <NavigationProvider initialPath={currentPath}>
            {getRouteComponent()}
        </NavigationProvider>
    );
};

export default App;
