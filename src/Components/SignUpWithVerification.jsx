import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/SignUpWithVerification.css';
import { FaEnvelope, FaLock, FaArrowLeft, FaSignInAlt } from 'react-icons/fa';
import OnboardingForm from '../Components/OnboardingForm.jsx';

const SignUpWithVerification = ({ setUser }) => {
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP verification, 3: Onboarding
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Timer for OTP resend
  useEffect(() => {
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
      const response = await fetch('http://localhost:3000/user/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStep(2);
        setTimer(60); // 60 seconds timer
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
      const response = await fetch('http://localhost:3000/user/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        setStep(3);
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
      const response = await fetch('http://localhost:3000/user/send-otp', {
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

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="verification-container">
      <div className="verification-form">
        {step > 1 && (
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft />
          </button>
        )}
        
        <h2>
          {step === 1 && 'Create your account'}
          {step === 2 && 'Verify your email'}
          {step === 3 && 'Complete your profile'}
        </h2>

        {step === 1 && (
          <>
            <form onSubmit={handleSendOTP}>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
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
            </form>
            
            <div className="back-to-login-section">
              <p>Already have an account?</p>
              <button className="back-to-login-button" onClick={handleBackToLogin}>
                <FaSignInAlt className="login-icon" />
                <span>Back to Login</span>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p className="otp-instructions">
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>
            <div className="input-group">
              <FaLock className="input-icon" />
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
            
            <div className="back-to-login-section">
              <button className="back-to-login-text" onClick={handleBackToLogin}>
                Back to Login
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <OnboardingForm email={email} setUser={setUser} />
        )}
      </div>
    </div>
  );
};

export default SignUpWithVerification;
