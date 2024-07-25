import React, { useState, useEffect } from 'react';
import '../Styles/Navbar.css';
import { FiLogIn } from "react-icons/fi";
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Navbar = () => {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleLogOut = () => {
    Cookies.remove('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h3>ShareChat</h3>
      </div>
      <div className="navbar-right">
        <div className="dropdown">
          <button className="settings-icon" onClick={toggleSettingsDropdown}>
            <i className="fa-solid fa-gear fa-lg"></i>
          </button>
          {showSettingsDropdown && (
            <div className="dropdown-content settings-dropdown">
              <a href="#">
                <div className='light'>
                  <i className="fa-solid fa-sun fa-xl"></i>
                  <span>Light Theme</span>
                </div>
              </a>
              <a href="#">
                <div className='dark'>
                  <i className="fa-solid fa-moon fa-xl"></i>
                  <span>Dark Theme</span>
                </div>
              </a>
              {!isLoggedIn ? (
                <Link to="/login">
                  <div className='login'>
                    <FiLogIn />
                    <span>Login / Sign Up</span>
                  </div>
                </Link>
              ) : (
                <a href="#">
                  <div className='navbar-logout' onClick={handleLogOut}>
                    <i className="fa-solid fa-sign-out-alt fa-xl"></i>
                    <span>Log Out</span>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
