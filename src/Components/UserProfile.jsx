import React, { useState, useEffect } from 'react';
import '../Styles/UserProfile.css';
import defaultAvatar from '../Constants/avatar.jpg';
import useUserStore from '../store/useUserStore.js';
import { LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [showProfile, setShowProfile] = useState(false);
  const { currentUser, fetchCurrentUser } = useUserStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'Loading...',
    avatar: defaultAvatar,
    about: 'Loading...',
    email: 'Loading...'
  });

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    fetchCurrentUser();
  }
}, []);


  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.name || 'No name available',
        avatar: currentUser.avatar?.url || defaultAvatar,
        about: currentUser.about || 'No information available',
        email: currentUser.email || 'No email available'
      });
    }
  }, [currentUser]);

  const handleLogOut = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className='userProfile'>
      <div className="icon-container">
        {/* <div className="icon star-icon">
          <Star size={20} />
        </div>
        <div className="icon settings-icon">
          <Settings size={20} />
        </div> */}
        <div className="profile-icon" onClick={toggleProfile}>
          <img src={userData.avatar} alt="Profile Icon" />
        </div>
      </div>
      
      {showProfile && (
        <div className="profile-overlay" onClick={toggleProfile}>
          <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
            <div className="profile-content">
              <div className="profile-image">
                <img src={userData.avatar} alt="Profile" />
              </div>
              <div className="profile-details">
                <div className='name'>
                  {userData.name}
                  {/* <PenLine size={16} className="icon-pen" /> */}
                </div>
                
                {/* <div className='about-section'>
                  <div className="section-title">About</div>
                  <div className="section-content">
                    {userData.about}
                    <PenLine size={16} className="icon-pen" />
                  </div>
                </div> */}
                
                <div className='about-section'>
                  <div className="section-title">Email Address</div>
                  <div className="section-content">
                    {userData.email}
                  </div>
                </div>
                
                <div className="divider"></div>
                
                <div className="handle-Logout">
                  <button className="logout" onClick={handleLogOut}>
                    <LogOut size={16} className="logout-icon" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
