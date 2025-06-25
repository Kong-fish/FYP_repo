import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import './Login.css';
import '../shared/Header.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';
import { ArrowLeft } from "lucide-react";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/"); 
  };

  return (
    <header className="header">
      <div className="header__content">
        <button onClick={handleBack} className="back-button" style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={24} />
          <span className="back-button-text" style={{ marginLeft: '8px' }}>Back</span>
        </button>
        <div className="header__title">
          <p>Eminent Western</p>
        </div>
        <DarkModeToggle />
      </div>
    </header>
  );
};

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Authenticate with Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      // Handle authentication errors (e.g., wrong password, user not found)
      setError(authError.message);
      console.error('Login error:', authError.message);
      setLoading(false);
      return; // Exit the function if authentication fails
    }

    if (data.user) {
      const userUuid = data.user.id; // Get the user's UUID from auth.users

      // 2. Check if the user is a Customer
      const { data: customerData, error: customerError } = await supabase
        .from('Customer')
        .select('customer_id')
        .eq('user_uuid', userUuid)
        .single(); // Use .single() as user_uuid is UNIQUE

      if (customerError && customerError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching customer profile:', customerError.message);
        setError('Failed to load user profile. Please try again.');
        await supabase.auth.signOut(); // Sign out user if profile check fails unexpectedly
        setLoading(false);
        return;
      }

      if (customerData) {
        // User is a customer
        navigate('/customer-dashboard');
        setLoading(false);
        return;
      }

      // 3. If not a Customer, check if the user is an Admin
      const { data: adminData, error: adminError } = await supabase
        .from('Admin')
        .select('admin_id')
        .eq('user_uuid', userUuid)
        .single(); // Use .single() as user_uuid is UNIQUE

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error fetching admin profile:', adminError.message);
        setError('Failed to load user profile. Please try again.');
        await supabase.auth.signOut(); // Sign out user if profile check fails unexpectedly
        setLoading(false);
        return;
      }

      if (adminData) {
        // User is an admin
        navigate('/admin-dashboard');
        setLoading(false);
        return;
      }

      // 4. If user authenticated but has no corresponding Customer or Admin profile
      setError('Login successful, but your user profile could not be found. Please contact support.');
      console.warn('Authenticated user has no associated Customer or Admin profile:', userUuid);
      await supabase.auth.signOut(); // Sign out the user, as their role is ambiguous
    } else {
      // This case should ideally not be hit if authError is null
      setError('An unexpected error occurred during login. No user data found.');
    }
    setLoading(false);
  };

  return (
    <div className="form-login-card">
      <div className="form-login__form button-group">
        <div className="imageContainer">
          <img
            src="/blue.png"
            alt="Banking Dashboard"
            width={500}
            height={400}
            className="dashboardImage"
          />
        </div>
        <p className="form-login__subtitle">Join us for a smarter way to finance your life.</p>

        <form onSubmit={handleLogin} className="login-form-fields">
          <div className="field">
            <input
              type="email"
              placeholder="Email"
              name="email"
              className="field__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <input
              type="password"
              placeholder="Password"
              name="password"
              className="field__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-message" style={{ textAlign: 'center', color: 'red', marginTop: '10px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="form-login__button button button--yellow"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="field" style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            to="/forgot-password"
            className="link forgot-password-link"
          >
            Forgot Your Password?
          </Link>
        </div>
        <div className="form-login__footer">
        </div>
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  return (
    <div className="landing-page-wrapper">
      <Header />
      <div className="landing-content-area">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;