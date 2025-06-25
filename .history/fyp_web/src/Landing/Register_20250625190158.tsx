import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supbaseClient.js';
import '../shared/normalize.css';
import '../shared/Header.css';
import DarkModeToggle from '../shared/DarkModeToggle.tsx';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for dark mode preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no preference saved, check system preference
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="header">
      <div className="header__content">
        <span className="header__title">Eminent Western</span>
        {/* Dark mode toggle switch */}
        <label className="switch">
          <input
            type="checkbox"
            id="darkModeToggle"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </header>
  );
};

// Register Component (mostly unchanged, but using the new Header)
function Register({ onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [icNo, setIcNo] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [nationality, setNationality] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Register component mounted');
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !firstName || !lastName || !username) {
      setError('Please provide email, password, first name, last name, and username.');
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up the user with email and password using Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        setError(authError.message || 'Error signing up.');
        console.error('Supabase sign-up error:', authError);
      } else if (authData?.user?.id) {
        console.log('User signed up successfully:', authData);

        // 2. Insert user details into the 'Customer' table
        const { data: customerData, error: customerError } = await supabase
          .from('Customer')
          .insert([
            {
              user_uuid: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              date_of_birth: dateOfBirth || null,
              ic_no: icNo || null,
              passport_no: passportNo || null,
              phone_no: phoneNo || null,
              home_address: homeAddress || null,
              nationality: nationality || null,
              username: username,
            },
          ]);

        if (customerError) {
          setError('Error creating user profile: ' + customerError.message);
          console.error('Supabase insert error:', customerError);
        } else {
          console.log('Customer profile created successfully:', customerData);
          navigate('/homepage');
          if (onRegisterSuccess) {
            onRegisterSuccess();
          }
        }
      } else {
        setError('Sign up successful, please check your email for a confirmation link.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during sign up.');
      console.error('Error during sign up:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header /> {/* Render the new Header component */}
      <div className="register-page">
        {/* Consider using .form-card or similar shared class here instead of register_form_container if styles are similar */}
        <form onSubmit={handleSignUp} className="register_form_container">
          <div className="register_form_column">
            <h1 className="register_form_title">Register</h1>
            <div className="field">
              <label htmlFor="firstName">First Name:</label>
              <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="field__input" required />
            </div>
            <div className="field">
              <label htmlFor="icNo">IC Number:</label>
              <input type="text" id="icNo" value={icNo} onChange={(e) => setIcNo(e.target.value)} className="field__input" />
            </div>
            <div className="field">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field__input" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field__input" required />
            </div>
            <div className="field">
              <label htmlFor="username">Username:</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="field__input" required />
            </div>
            <div className="field">
              <label htmlFor="dateOfBirth">Date of Birth:</label>
              <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="field__input" />
            </div>
          </div>
          <div className="register_form_column">
            <div className="field">
              <label htmlFor="lastName">Last Name:</label>
              <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="field__input" required />
            </div>
            <div className="field">
              <label htmlFor="passportNo">Passport Number:</label>
              <input type="text" id="passportNo" value={passportNo} onChange={(e) => setPassportNo(e.target.value)} className="field__input" />
            </div>
            <div className="field">
              <label htmlFor="phoneNo">Phone Number:</label>
              <input type="tel" id="phoneNo" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} className="field__input" />
            </div>
            <div className="field">
              <label htmlFor="homeAddress">Home Address:</label>
              <textarea id="homeAddress" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} className="field__input" />
            </div>
            <div className="field">
              <label htmlFor="nationality">Nationality:</label>
              <input type="text" id="nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} className="field__input" />
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
          {/* Use the shared button class */}
          <button type="submit" className="button button--yellow" disabled={loading}>
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;