import React, { useState, useEffect, createContext, useContext } from 'react';

const supabase = {
    auth: {
        signOut: async () => {
            console.log("Mock Supabase: User signed out.");
            // Simulate a successful sign out
            return { error: null };
        },
        // Mocking getSession for potential future use or if needed by DarkModeToggle
        getSession: async () => ({ data: { session: null }, error: null })
    },
    from: (tableName) => ({
        select: (columns) => ({
            eq: (column, value) => ({
                single: async () => {
                    console.log(`Mock Supabase: Fetching from ${tableName} where ${column} = ${value} with columns: ${columns}`);
                    // Simulate fetching data for customer details
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
                                    }
                                ]
                            },
                            error: null
                        };
                    }
                    return { data: null, error: { message: "Customer not found (mock data)." } };
                }
            }),
        }),
        update: (updates) => ({
            eq: (column, value) => ({
                select: async () => {
                    console.log(`Mock Supabase: Updating ${column} = ${value} with:`, updates);
                    // Simulate a successful update
                    return {
                        data: [{ ...updates, account_id: value }], // Return the updated data
                        error: null
                    };
                }
            })
        }),
        delete: () => ({
            eq: (column, value) => ({
                async then(resolve, reject) {
                    console.log(`Mock Supabase: Deleting from Customer where ${column} = ${value}`);
                    if (value === 'mock-customer-123') {
                        // Simulate successful deletion
                        resolve({ data: null, error: null });
                    } else {
                        // Simulate an error if a different ID was provided
                        reject({ error: { message: "Mock deletion failed for unknown customer ID." } });
                    }
                }
            })
        })
    })
};

// --- Context for Navigation and Params ---
// This replaces react-router-dom for Canvas environment
const NavigationContext = createContext({
    navigate: (path) => console.log(`Navigating to: ${path}`),
    params: {},
});

const NavigationProvider = ({ children, initialPath = '/admin-dashboard' }) => {
    const [path, setPath] = useState(initialPath);
    const [params, setParams] = useState({});

    const navigate = (newPath) => {
        setPath(newPath);
        // Basic param extraction for /customer-details/:customerId
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
// In a real project, you would import these from 'lucide-react'
const CheckCircle = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-check-circle ${className}`} {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
    </svg>
);

const XCircle = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-x-circle ${className}`} {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
    </svg>
);

const Loader2 = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-loader-2 ${className}`} {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const User = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-user ${className}`} {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const FileText = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-file-text ${className}`} {...props}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
    </svg>
);

const ArrowLeft = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-arrow-left ${className}`} {...props}>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const Trash2 = ({ size = 24, className = '', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-trash-2 ${className}`} {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
);


// --- DarkModeToggle Component (Dummy) ---
const DarkModeToggle = () => {
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
const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/customer-landing'); // Redirect to customer-landing as per original code comment
        }
    };

    return (
        <header className="w-full bg-card-bg-light dark:bg-card-bg-dark shadow-md p-4 flex justify-between items-center rounded-b-lg">
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-text-primary dark:text-text-dark">Eminent Western</h1>
            </div>
            <div className="flex items-center space-x-4">
                <DarkModeToggle />
                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-primary-light text-text-primary rounded-lg shadow hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
                >
                    Sign Out
                </button>
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
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<CustomerDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // New state for delete loading

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            setLoading(true);
            setError(null);
            setCustomer(null);

            // Using mock-customer-123 as the ID for demonstration with mock data
            // In a real application, customerId would come directly from the URL params.
            const currentCustomerId = customerId || 'mock-customer-123';

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
        setShowDeleteConfirm(false); // Close the confirmation modal immediately

        // Use the actual customerId from useParams, fallback to mock if not available
        const idToDelete = customerId || 'mock-customer-123';

        if (!idToDelete) {
            setUpdateMessage("Cannot delete: Customer ID is missing.");
            setIsDeleting(false);
            return;
        }

        try {
            // In a real application, ensure your database rules handle cascading deletes
            // or explicitly delete related records (e.g., Accounts) before deleting the customer.
            const { error: deleteError } = await supabase
                .from('Customer')
                .delete()
                .eq('customer_id', idToDelete);

            if (deleteError) {
                throw deleteError;
            }

            setUpdateMessage(`Customer ${idToDelete} successfully deleted.`);
            // Redirect after a short delay to allow message to be seen
            setTimeout(() => navigate('/admin-dashboard'), 1500);

        } catch (err: any) {
            console.error("Error deleting customer:", err.message);
            setUpdateMessage(`Failed to delete customer: ${err.message}`);
        } finally {
            setIsDeleting(false);
            setTimeout(() => setUpdateMessage(null), 3000);
        }
    };


    const getStatusClass = (status: string | boolean | null) => {
        if (typeof status === "boolean") {
            return status ? "bg-success-light-bg text-success-dark-text" : "bg-error-light-bg text-error-dark-text";
        }
        switch (status?.toLowerCase()) {
            case "active":
            case "approved":
                return "bg-success-light-bg text-success-dark-text";
            case "pending":
            case "under review":
            case "null":
                return "bg-warning-light-bg text-warning-dark-text";
            case "inactive":
            case "rejected":
            case "failed":
                return "bg-error-light-bg text-error-dark-text";
            default:
                return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary dark:text-text-dark flex flex-col font-inter">
                <Header />
                <main className="flex-grow flex items-center justify-center p-6">
                    <Loader2 className="animate-spin text-primary-light dark:text-primary-dark" size={32} />
                    <p className="ml-2 text-text-primary dark:text-text-dark">Loading customer details...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary dark:text-text-dark flex flex-col font-inter">
                <Header />
                <main className="flex-grow flex items-center justify-center p-6">
                    <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-lg p-6 text-center max-w-md w-full">
                        <h2 className="text-xl font-semibold text-error-dark-text">Error</h2>
                        <p className="text-text-secondary dark:text-text-dark-secondary mt-2">{error}</p>
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="mt-4 px-6 py-2 bg-primary-light text-text-primary rounded-lg shadow hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
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
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary dark:text-text-dark flex flex-col font-inter">
                <Header />
                <main className="flex-grow flex items-center justify-center p-6">
                    <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-lg p-6 text-center max-w-md w-full">
                        <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark">Customer Not Found</h2>
                        <p className="text-text-secondary dark:text-text-dark-secondary mt-2">The customer with ID "{customerId}" could not be found.</p>
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="mt-4 px-6 py-2 bg-primary-light text-text-primary rounded-lg shadow hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
                        >
                            Go back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary dark:text-text-dark flex flex-col font-inter antialiased">
            <Header />
            <main className="flex-grow p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <div className="relative flex items-center justify-center mb-6">
                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="absolute left-0 flex items-center px-4 py-2 rounded-lg text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-50"
                        title="Back to Dashboard"
                        disabled={isDeleting || isUpdating} // Disable back button during operations
                    >
                        <ArrowLeft className="mr-2 group-hover:translate-x-[-2px] transition-transform duration-200" size={20} />
                        <span className="font-semibold">Back</span>
                    </button>
                    <h2 className="text-3xl font-extrabold text-text-primary dark:text-text-dark text-center flex-grow">Customer Details</h2>
                </div>

                {updateMessage && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center justify-between text-base font-medium transition-opacity duration-300 ${updateMessage.includes('Failed') ? 'bg-error-light-bg text-error-dark-text' : 'bg-success-light-bg text-success-dark-text'}`}>
                        <span>{updateMessage}</span>
                        <button onClick={() => setUpdateMessage(null)} className="text-lg font-bold p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <XCircle size={20} className="inline-block" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Customer Information Card */}
                    {/* Tailwind's `grid-cols-1 sm:grid-cols-2` effectively creates `grid-template-columns: repeat(2, minmax(0, 1fr))` on small screens and above. */}
                    <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-lg p-6 flex flex-col">
                        <div className="flex items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark">
                            <User className="mr-3 text-primary-light dark:text-primary-dark" size={24} />
                            <h3 className="text-xl font-bold text-text-primary dark:text-text-dark">Customer Information</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 flex-grow">
                            <div>
                                <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">Customer ID</p>
                                <p className="text-lg font-semibold text-text-primary dark:text-text-dark break-all">{customer.customer_id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">Name</p>
                                <p className="text-lg font-semibold text-text-primary dark:text-text-dark">{customer.first_name} {customer.last_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">Email/Username</p>
                                <p className="text-lg font-semibold text-text-primary dark:text-text-dark break-all">{customer.username}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">Phone Number</p>
                                <p className="text-lg font-semibold text-text-primary dark:text-text-dark">{customer.phone_no}</p>
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <p className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">Member Since</p>
                                <p className="text-lg font-semibold text-text-primary dark:text-text-dark">{new Date(customer.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark flex justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center px-4 py-2 bg-error-light text-white rounded-lg shadow-md hover:bg-error-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-error-light-bg focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isDeleting || isUpdating} // Disable delete button during any operation
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

                    {/* Account Details Card (spans full width on larger screens for better table display) */}
                    {/* Tailwind's `col-span-1 lg:col-span-2` makes this card span 2 columns on large screens. */}
                    <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-lg p-6 col-span-1 lg:col-span-2">
                        <div className="flex items-center mb-4 pb-4 border-b border-border-light dark:border-border-dark">
                            <FileText className="mr-3 text-primary-light dark:text-primary-dark" size={24} />
                            <h3 className="text-xl font-bold text-text-primary dark:text-text-dark">Linked Accounts</h3>
                        </div>
                        <div className="overflow-x-auto">
                            {customer.Account && customer.Account.length > 0 ? (
                                <table className="min-w-full divide-y divide-border-light dark:divide-border-dark rounded-lg overflow-hidden">
                                    <thead className="bg-table-header-light dark:bg-table-header-dark">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider rounded-tl-lg">Account No.</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">Type</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">Balance</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">Nickname</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">Created On</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">Approved On</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider rounded-tr-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-table-row-light dark:bg-table-row-dark divide-y divide-border-light dark:divide-border-dark">
                                        {customer.Account.map((account) => (
                                            <tr key={account.account_id} className="hover:bg-table-hover-light dark:hover:bg-table-hover-dark transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-dark">{account.account_no}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-dark-secondary">{account.account_type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-dark">${account.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-dark-secondary">{account.nickname || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(account.account_status)}`}>
                                                        {account.account_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-dark-secondary">
                                                    {new Date(account.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-text-dark-secondary">
                                                    {account.approved_at ? new Date(account.approved_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        {account.account_status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-success-light hover:bg-success-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-light-bg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    onClick={() => handleAccountStatusUpdate(account.account_id, 'Active')}
                                                                    disabled={isUpdating || isDeleting} // Disable during any operation
                                                                    title="Approve Account"
                                                                >
                                                                    <CheckCircle size={16} className="mr-1" /> Approve
                                                                </button>
                                                                <button
                                                                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-error-light hover:bg-error-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-light-bg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    onClick={() => handleAccountStatusUpdate(account.account_id, 'Rejected')}
                                                                    disabled={isUpdating || isDeleting} // Disable during any operation
                                                                    title="Reject Account"
                                                                >
                                                                    <XCircle size={16} className="mr-1" /> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {(account.account_status === 'Active' || account.account_status === 'Rejected') && (
                                                            <button
                                                                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-text-primary bg-info-light hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-info-light-bg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                onClick={() => handleAccountStatusUpdate(account.account_id, 'Pending')}
                                                                disabled={isUpdating || isDeleting} // Disable during any operation
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all duration-300 scale-100 opacity-100">
                        <XCircle size={32} className="text-error-light mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text-primary dark:text-text-dark mb-3">Confirm Deletion</h3>
                        <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
                            Are you sure you want to delete customer <span className="font-semibold">{customer?.first_name} {customer?.last_name}</span> (ID: {customer?.customer_id})?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-text-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCustomer}
                                className="px-6 py-2 bg-error-light text-white rounded-lg shadow-md hover:bg-error-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-error-light-bg focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

    // Mocking browser-like history pushState for URL changes without actual routing
    useEffect(() => {
        const handlePopState = (event) => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (path) => {
        window.history.pushState({}, '', path);
        setCurrentPath(path);
    };

    const getRouteComponent = () => {
        if (currentPath.startsWith('/customer-details/')) {
            // useParams will automatically pick up the customerId from the path managed by NavigationProvider
            return <CustomerDetailsPage />;
        } else if (currentPath === '/admin-dashboard' || currentPath === '/') {
            // This is a placeholder for the dashboard. In a real app, you'd render your dashboard here.
            return (
                <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary dark:text-text-dark flex flex-col font-inter antialiased">
                    <Header />
                    <main className="flex-grow flex items-center justify-center p-6">
                        <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-lg p-6 text-center max-w-md w-full">
                            <h2 className="text-2xl font-bold text-primary-light dark:text-primary-dark mb-4">Admin Dashboard</h2>
                            <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
                                This is a placeholder for the admin dashboard.
                                Click the button below to view mock customer details.
                            </p>
                            <button
                                onClick={() => navigate('/customer-details/mock-customer-123')}
                                className="px-6 py-3 bg-primary-light text-text-primary font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
                            >
                                View Mock Customer Details
                            </button>
                            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-4">
                                (Customer ID for mock data: mock-customer-123)
                            </p>
                        </div>
                    </main>
                </div>
            );
        } else if (currentPath === '/customer-landing') {
             return (
                <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary dark:text-text-dark flex flex-col font-inter antialiased">
                    <Header /> {/* Still show header even on landing, or you can create a different landing header */}
                    <main className="flex-grow flex items-center justify-center p-6">
                        <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-lg p-6 text-center max-w-md w-full">
                            <h2 className="text-2xl font-bold text-primary-light dark:text-primary-dark mb-4">Customer Landing Page</h2>
                            <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
                                You have successfully signed out. This is a placeholder for the customer landing page.
                            </p>
                            <button
                                onClick={() => navigate('/admin-dashboard')}
                                className="px-6 py-3 bg-primary-light text-text-primary font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
                            >
                                Go to Admin Dashboard (Sign In)
                            </button>
                        </div>
                    </main>
                </div>
            );
        }
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary dark:text-text-dark flex flex-col font-inter antialiased">
                <Header />
                <main className="flex-grow flex items-center justify-center p-6">
                    <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-lg p-6 text-center max-w-md w-full">
                        <h2 className="text-2xl font-bold text-error-dark-text mb-4">404 - Page Not Found</h2>
                        <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
                            The requested page does not exist.
                        </p>
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="px-6 py-3 bg-primary-light text-text-primary font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
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
