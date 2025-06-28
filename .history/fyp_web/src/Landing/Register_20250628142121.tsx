import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../supabaseClient.js'; // Ensure this file exists in shared/
import '../shared/normalize.css'; // Ensure this file exists in shared/
import './Register.css'; // Ensure this file exists in the same directory as Register.tsx

// Register Component
function Register() {
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

  const handleSignUp = async (e: React.FormEvent) => {
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
          navigate('/login');
        }
      } else {
        setError('Sign up successful, please check your email for a confirmation link.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign up.');
      console.error('Error during sign up:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="register-page">
        <form onSubmit={handleSignUp} className="register_form_container">
          <h1 className="register_form_title">Register</h1>

          {/* First column */}
          <div className="register_form_column">
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
            <div className="field">
              <label htmlFor="firstName">First Name:</label>
              <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="field__input" required />
            </div>
          </div>

          {/* Second column */}
          <div className="register_form_column">
            <div className="field">
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field__input" required />
            </div>
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
            <div className="field">
              <label htmlFor="icNo">IC Number:</label>
              <input type="text" id="icNo" value={icNo} onChange={(e) => setIcNo(e.target.value)} className="field__input" />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="button button--yellow" disabled={loading}>
            {loading ? 'Loading...' : 'Register'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem', width: '100%' }}>
            <Link to="/login" style={{ color: 'var(--button-primary-bg)', textDecoration: 'none', fontWeight: 'bold' }}>
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
