import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import '../Styles/UserProfile.css';
import defaultAvatar from '../Constants/avatar.jpg';
import useUserStore from '../store/useUserStore.js';
// Import Lucide icons
import { Star, Settings, PenLine, LogOut } from 'lucide-react';

const UserProfile = () => {
  const [showProfile, setShowProfile] = useState(false);
  const { currentUser, fetchCurrentUser } = useUserStore();
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
    const loadUserData = async () => {
      try {
        await fetchCurrentUser();
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, [fetchCurrentUser]);

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

  return (
    <div className='userProfile'>
      <div className="icon-container">
        <div className="icon star-icon">
          <Star size={20} /> {/* Lucide Star icon */}
        </div>
        <div className="icon settings-icon">
          <Settings size={20} /> {/* Lucide Settings icon */}
        </div>
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
                  <PenLine size={16} className="icon-pen" /> {/* Lucide Pen icon */}
                </div>
                
                <div className='about-section'>
                  <div className="section-title">About</div>
                  <div className="section-content">
                    {userData.about}
                    <PenLine size={16} className="icon-pen" /> {/* Lucide Pen icon */}
                  </div>
                </div>
                
                <div className='about-section'>
                  <div className="section-title">Email Address</div>
                  <div className="section-content">
                    {userData.email}
                  </div>
                </div>
                
                <div className="divider"></div>
                
                <div className="handle-Logout">
                  <button className="logout">
                    <LogOut size={16} className="logout-icon" /> {/* Lucide LogOut icon */}
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
