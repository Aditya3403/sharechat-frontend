import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../Styles/LogIn.css';
import { FaGoogle, FaArrowLeft } from 'react-icons/fa';

const LogIn = ({ setUser }) => {
  const [isLogIn, setIsLogIn] = useState(true);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStep(2);
        setTimer(60);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        navigate('/onboarding', { state: { verifiedEmail: email } });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Error verifying OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setTimer(60);
        alert('OTP sent successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert('Error resending OTP. Please try again.');
    }
  };

  const handleLogIn = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set('token', data.token, { expires: 30 });
        localStorage.setItem('token', data.token);
        setUser(true);
        navigate('/');
      } else {
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    }
  };

  const toggleLogIn = () => {
    setIsLogIn(!isLogIn);
    setStep(1);
    setEmail('');
    setOtp('');
    setPassword('');
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
    }
  };

  if (!isLogIn && step < 3) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          {step > 1 && (
            <button className="back-button" onClick={handleBack}>
              <FaArrowLeft />
            </button>
          )}
          
          <h2>
            {step === 1 && 'Create your account'}
            {step === 2 && 'Verify your email'}
          </h2>

          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
              
              <p className="toggle-auth" onClick={toggleLogIn}>
                Already have an account? Log in
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <p className="otp-instructions">
                We've sent a 6-digit verification code to <strong>{email}</strong>
              </p>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              <p className="resend-otp">
                Didn't receive the code?{' '}
                <span 
                  className={timer > 0 ? 'resend-disabled' : 'resend-enabled'} 
                  onClick={handleResendOTP}
                >
                  Resend {timer > 0 ? `(${timer}s)` : ''}
                </span>
              </p>
              
              <p className="toggle-auth" onClick={toggleLogIn}>
                Already have an account? Log in
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Log in</h2>
        
        <form onSubmit={handleLogIn}>
          <div className="input-group">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button">
            Continue
          </button>
        </form>
        
        <div className="divider">
          <span>OR CONTINUE WITH</span>
        </div>
        
        <button className="google-button">
          <FaGoogle className="google-icon" />
          <span>Google</span>
        </button>
        
        <p className="toggle-auth" onClick={toggleLogIn}>
          Don't have an account? Sign up
        </p>
      </div>
    </div>
  );
};

export default LogIn;
