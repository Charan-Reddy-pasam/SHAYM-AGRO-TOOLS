import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginPopup.css';

const API_BASE = "https://excretory-powdering-mocker.ngrok-free.dev/api/Auth";

const LoginPopup = ({ isOpen, onClose }) => {
  // ── All hooks MUST be declared before any conditional return ──
  const [step, setStep] = useState('phone'); // 'phone', 'details', 'otp'
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState({ name: '', email: '' });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  // Guards to prevent duplicate submissions
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);

  useEffect(() => {
    if (step !== 'otp') return;
    if (resendTimer === 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [resendTimer, step]);

  // ── Early return AFTER all hooks ──
  if (!isOpen) return null;

  // ── Handlers ──
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneSubmitted) return; // Prevent duplicate clicks
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit number");
      return;
    }

    setPhoneSubmitted(true);
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/login`,
        { MobileNumber: phone },
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );

      if (response.data.needsProfile || response.data.isNewUser) {
        setStep('details');
      } else {
        setStep('otp');
        setResendTimer(60);
        setCanResend(false);
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.title || err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
      setPhoneSubmitted(false); // Reset guard so user can retry on error
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (detailsSubmitted) return; // Prevent duplicate clicks
    if (!details.name.trim()) {
      setError("Name is required");
      return;
    }

    setDetailsSubmitted(true);
    setIsLoading(true);
    setError('');
    try {
      console.log("Submitting details for:", phone);
      // Send only MobileNumber and Name — backend sends OTP to mobile
      await axios.post(`${API_BASE}/complete-profile`, {
        MobileNumber: phone,
        Name: details.name,
        FullName: details.name
      }, { headers: { 'ngrok-skip-browser-warning': 'true' } });

      console.log("Profile update request sent");
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
      setError('');
    } catch (err) {
      console.error("Profile Error Details:", err.response?.data || err.message);
      setError(err.response?.data?.title || err.response?.data?.message || "Failed to update profile.");
      setDetailsSubmitted(false); // Reset guard so user can retry on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (details.name) {
        // New user: resend via complete-profile
        await axios.post(`${API_BASE}/complete-profile`, {
          MobileNumber: phone,
          Name: details.name,
          FullName: details.name
        }, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      } else {
        // Existing user: resend via login
        await axios.post(`${API_BASE}/login`,
          { MobileNumber: phone },
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
      }
      setResendTimer(60);
      setCanResend(false);
      setError('');
    } catch (err) {
      console.error("Resend OTP Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      console.log("Verifying OTP for:", phone);
      const response = await axios.post(`${API_BASE}/verify-otp`, {
        MobileNumber: phone,
        Otp: otp
      }, { headers: { 'ngrok-skip-browser-warning': 'true' } });

      console.log("Verify Response Body:", response.data);

      if (response.data.success === true || (response.status === 200 && response.data.token)) {
        // Save email to profile post-verification if provided
        if (details.email) {
          try {
            await axios.post(`${API_BASE}/complete-profile`, {
              MobileNumber: phone,
              Name: details.name,
              FullName: details.name,
              Email: details.email
            }, { headers: { 'ngrok-skip-browser-warning': 'true' } });
          } catch (profileErr) {
            console.error("Failed to save email post-verification:", profileErr.response?.data || profileErr.message);
          }
        }

        const userData = response.data.user || response.data;
        const userObj = {
          phone: phone,
          name: userData.name || userData.fullName || details.name || 'User',
          email: userData.email || details.email,
          token: response.data.token || userData.token,
          wallet: userData.wallet || 0,
          id: userData.id || userData.userId,
          loggedIn: true
        };

        localStorage.setItem('user', JSON.stringify(userObj));
        onClose();
        window.location.reload();
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Verify Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "OTP Verification failed. Please check the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setDetails({ name: '', email: '' });
    setOtp('');
    setError('');
    setPhoneSubmitted(false);
    setDetailsSubmitted(false);
    onClose();
  };

  return (
    <div className="login-overlay" onClick={(e) => e.target.className === 'login-overlay' && resetForm()}>
      <div className="login-modal-container">
        {/* Left Side Image Section */}
        <div className="login-left-image">
          <img src="/popup-bg.png" alt="Agriculture" />
        </div>

        {/* Right Side Content Section */}
        <div className="login-right-content">
          <button className="close-button-circular" onClick={resetForm}>
            <i className="fas fa-times"></i>
          </button>

          <div className="login-logo-mini">
            <img src="/logo.svg" alt="Shyam Agro Tools logo" />
          </div>

          <h2>SIGN UP TO GET OFFERS.</h2>
          <p>SIGN UP to get the best offers and discount today.</p>

          {error && <div className="login-error-msg" style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>{error}</div>}

          <div className="login-form-wrapper">
            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit}>
                <input
                  type="tel"
                  className="premium-input-field"
                  placeholder="Enter MOBILE NUMBER Here"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
                <button type="submit" className="premium-action-btn" disabled={isLoading || phoneSubmitted}>
                  {isLoading ? 'SENDING...' : 'SUBSCRIBE'}
                </button>
              </form>
            )}

            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit}>
                <input
                  type="text"
                  className="premium-input-field"
                  placeholder="ENTER FULL NAME"
                  required
                  value={details.name}
                  onChange={(e) => setDetails({...details, name: e.target.value})}
                  autoFocus
                />
                <input
                  type="email"
                  className="premium-input-field"
                  placeholder="ENTER EMAIL ID"
                  value={details.email}
                  onChange={(e) => setDetails({...details, email: e.target.value})}
                />
                <button type="submit" className="premium-action-btn" disabled={isLoading || detailsSubmitted}>
                  {isLoading ? 'UPDATING...' : 'CONTINUE'}
                </button>
                <div style={{ cursor: 'pointer', fontSize: '10px', color: '#888', marginTop: '5px' }} onClick={() => setStep('phone')}>BACK</div>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerify}>
                <input
                  type="text"
                  className="premium-input-field"
                  placeholder="ENTER 4-DIGIT OTP"
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
                <button type="submit" className="premium-action-btn" disabled={isLoading}>
                  {isLoading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11px', fontFamily: 'inherit' }}>
                  {canResend ? (
                    <span
                      style={{ cursor: 'pointer', color: '#6dbd2f', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                      onClick={handleResendOtp}
                    >
                      ↺ Resend OTP
                    </span>
                  ) : (
                    <span style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Resend in <strong style={{ color: '#6dbd2f' }}>{resendTimer}s</strong>
                    </span>
                  )}
                  <span
                    style={{ cursor: 'pointer', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                    onClick={() => setStep('phone')}
                  >
                    Change Number
                  </span>
                </div>
              </form>
            )}

            <div className="remember-me-container">
              <input type="checkbox" id="remember-me" />
              <label htmlFor="remember-me">REMEMBER ME .....!</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
