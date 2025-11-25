import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../Styles/OnboardingForm.css';
import avatar from '../Constants/avatar.jpg';
import { FaPen, FaUser, FaPhone, FaEye, FaEyeSlash, FaArrowLeft, FaLock, FaGlobe } from 'react-icons/fa';

const OnboardingForm = ({ setUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    discoverySource: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const verifiedEmail = location.state?.verifiedEmail || '';

  const discoverySources = [
    'Google Search',
    'Friend Referral',
    'Social Media',
    'Advertisement',
    'Other'
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(file);
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    document.getElementById('imageUpload').click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    if (!verifiedEmail) {
      alert('Email verification required. Please go back and verify your email.');
      return;
    }

    setIsLoading(true);

    const submitData = new FormData();
    submitData.append('email', verifiedEmail);
    submitData.append('firstName', formData.firstName);
    submitData.append('lastName', formData.lastName);
    submitData.append('phoneNumber', formData.phoneNumber);
    submitData.append('discoverySource', formData.discoverySource);
    submitData.append('password', formData.password);
    
    if (selectedFile) {
      submitData.append('image', selectedFile);
    }

    try {
      const response = await fetch('http://localhost:3000/user/signup', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set('token', data.token, { expires: 30 });
        localStorage.setItem('token', data.token);
        setUser(true);
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Error signing up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-form-rectangle">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        
        <div className="form-header">
          <h2>Complete your profile</h2>
          <p className="form-subtitle">Fill in your details to get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className="rectangular-form">
          {/* Left Column - Profile Picture */}
          <div className="form-left-column">
            <div className="avatar-section">
              <div className="avatar-container">
                <img src={previewImage || avatar} alt="Avatar" className="avatar" />
                <button type="button" className="image-upload-button" onClick={handleButtonClick}>
                  <FaPen className="edit-icon" />
                </button>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              <p className="avatar-label">Add Profile Picture</p>
            </div>

            
          </div>

          {/* Right Column - Form Fields */}
          <div className="form-right-column">

            {/* Verified Email Display */}
            <div className="verified-email-section">
              <p className="verified-email">
                <FaUser className="verified-icon" />
                Verified: {verifiedEmail}
              </p>
            </div>
            
            {/* Personal Information */}
            <div className="form-grid">
              <div className="input-group-horizontal">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group-horizontal">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group-horizontal">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group-horizontal">
                <FaGlobe className="input-icon" />
                <select
                  name="discoverySource"
                  value={formData.discoverySource}
                  onChange={handleInputChange}
                  required
                  className="select-input"
                >
                  <option value="">How did you find out about us?</option>
                  {discoverySources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group-horizontal">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="input-group-horizontal">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button-rectangular" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;
