import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../Styles/LogIn.css';
import avatar from '../Constants/avatar.jpg';

const LogIn = ({ setUser }) => {
  const [isLogIn, setIsLogIn] = useState(false);
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

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

  const handleSignUp = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('firstName', fname);
    formData.append('lastName', lname);
    formData.append('email', email);
    formData.append('password', password);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const response = await fetch('http://localhost:3000/user/signup', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set('token', data.token, { expires: 30 });
        setUser(true);
        navigate('/');
      } else {
        console.error('Sign up failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleLogIn = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set('token', data.token, { expires: 30 });
        setUser(true);
        navigate('/');
      } else {
        console.error('Login failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const toggleLogIn = () => setIsLogIn(!isLogIn);

  return (
    isLogIn ? (
      <div className="login-container">
        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleLogIn}>
            <div className="input-container">
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-container">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="login-button" type="submit">Log In</button>
          </form>
          <p className="switch-page-text" onClick={toggleLogIn}>Don't have an account? Sign Up</p>
        </div>
      </div>
    ) : (
      <div className="signup-container">
        <form onSubmit={handleSignUp}>
          <div className="signup-form">
            <h2>Sign Up</h2>
            <div className="avatar-container">
              <img src={previewImage || avatar} alt="Avatar" className="avatar" />
              <button type="button" className="imageUpload" onClick={handleButtonClick}>
                <i className="fa-solid fa-pen"></i>
                <span>Image</span>
              </button>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="input-container">
              <input
                type="text"
                placeholder="First Name"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
            </div>
            <div className="input-container">
              <input
                type="text"
                placeholder="Last Name"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
              />
            </div>
            <div className="input-container">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-container">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="signup-button" type="submit">Sign Up</button>
            <p className="switch-page-text" onClick={toggleLogIn}>Already have an account? Log In</p>
          </div>
        </form>
      </div>
    )
  );
};

export default LogIn;
