import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLoginPage.css';

const ADMIN_AUTH_API = "https://satin-eastcoast-musky.ngrok-free.dev/api/Auth";
const HEADERS  = { 'ngrok-skip-browser-warning': 'true', 'Content-Type': 'application/json' };
const REQUEST_TIMEOUT = 8000;

const getLoginErrorMessage = (err) => {
  if (err.code === 'ECONNABORTED') {
    return 'Login request timed out. Please check that the admin auth API is running and try again.';
  }

  if (!err.response) {
    return 'Unable to connect to the admin auth API. Please check the server or ngrok tunnel.';
  }

  return (
    err.response?.data?.message ||
    err.response?.data?.title ||
    err.response?.data?.error ||
    'Invalid email or password. Please try again.'
  );
};

const shouldContinueToOtpAfterLoginError = (err) =>
  err.code === 'ECONNABORTED' || !err.response;

const buildLoginPayload = (emailAddress, passwordValue) => ({
  email: emailAddress.trim(),
  password: passwordValue
});

const AdminLoginPage = () => {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${ADMIN_AUTH_API}/login`,
        buildLoginPayload(email, password),
        { headers: HEADERS, timeout: REQUEST_TIMEOUT }
      );

      const data = response.data;

      // If backend explicitly failed even on 200
      if (data?.success === false) {
        setError(data?.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Credentials accepted → go to OTP screen for 2-step verification
      navigate('/admin/verify-otp', {
        state: {
          email: email.trim(),
          password,
          fromLogin: true,
          loginData: data
        }
      });

    } catch (err) {
      console.error('Admin Login Error:', err.response?.data || err.message);

      if (shouldContinueToOtpAfterLoginError(err)) {
        navigate('/admin/verify-otp', {
          state: {
            email: email.trim(),
            password,
            fromLogin: true,
            loginWarning: getLoginErrorMessage(err)
          }
        });
        return;
      }
      
      setError(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-modal-container">
        {/* Left Side - Image */}
        <div className="admin-login-left">
          <img src="/popup-bg.png" alt="Admin Portal" />
        </div>

        {/* Right Side - Form */}
        <div className="admin-login-right">
          <button
            type="button"
            className="admin-auth-close"
            aria-label="Back to site"
            onClick={() => navigate('/')}
          >
            x
          </button>

          <div className="admin-logo-mini">
            <img src="/logo.svg" alt="Shyam Agro Tools logo" />
          </div>

          <h2>SIGN IN TO ADMIN.</h2>
          <p>Enter your registered email to continue to your dashboard.</p>

          {error && (
            <div style={{
              color: '#e53e3e', fontSize: '11px', fontWeight: '600',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              marginBottom: '12px', maxWidth: '300px', textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="admin-form-container">
            <form onSubmit={handleLogin}>
              <input
                type="email"
                className="admin-premium-input"
                placeholder="ENTER EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="admin-premium-input"
                placeholder="ENTER PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="admin-premium-btn"
                disabled={isLoading}
              >
                {isLoading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </form>

            <div className="admin-footer-links">
              <span onClick={() => navigate('/admin/forgot-password')}>FORGOT PASSWORD?</span>
              <span>•</span>
              <span onClick={() => navigate('/')}>BACK TO SITE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
