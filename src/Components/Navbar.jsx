import React, { useState, useEffect } from 'react';
import '../Styles/Navbar.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import useUserStore from '../store/useUserStore.js';

const Navbar = () => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const { currentUser, fetchCurrentUser, updateUser } = useUserStore();
  const navigate = useNavigate();

  // Get notifications from currentUser object
  const allNotifications = currentUser?.notifications || [];
  const newNotifications = allNotifications.filter(n => !n.archived);
  const archivedNotifications = allNotifications.filter(n => n.archived);
  const unreadCount = newNotifications.filter(n => !n.read).length;

  // Determine which notifications to display based on active tab
  const displayedNotifications = activeTab === 'new' ? newNotifications : archivedNotifications;

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  const toggleNotificationsDropdown = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    
    return 'Just now';
  };

  const handleArchiveNotification = async (notificationId) => {
    try {
      const updatedNotifications = allNotifications.map(notification => {
        if (notification._id === notificationId) {
          return { ...notification, archived: true, read: true };
        }
        return notification;
      });
      
      // Update the user in the Zustand store
      await updateUser({ notifications: updatedNotifications });
      
      // Force refresh the current user data
      await fetchCurrentUser();
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
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
        {isLoggedIn && (
          <div className="dropdown">
            <button className="notifications-icon" onClick={toggleNotificationsDropdown}>
              <i className="fa-regular fa-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {showNotificationsDropdown && (
              <div className="dropdown-content notifications-dropdown">
                <div className="notifications-header">
                  <h4>Notifications</h4>
                  <div className="notification-tabs">
                    <button 
                      className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                      onClick={() => setActiveTab('new')}
                    >
                      New {unreadCount > 0 && `(${unreadCount})`}
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'archived' ? 'active' : ''}`}
                      onClick={() => setActiveTab('archived')}
                    >
                      Archived ({archivedNotifications.length})
                    </button>
                  </div>
                </div>
                
                {displayedNotifications.length > 0 ? (
                  <div className="notifications-list">
                    {displayedNotifications.map((notification) => (
                      <div key={notification._id} className="notification-item">
                        <div className="notification-sender">
                          <img 
                            src={notification.senderAvatar?.url || '/default-profile.png'} 
                            alt={notification.senderName}
                            className="notification-profile-pic"
                          />
                        </div>
                        <div className="notification-content">
                          <p>
                            <strong>{notification.senderName}</strong> sent you a message
                          </p>
                          <small>{formatTimeAgo(notification.createdAt)}</small>
                        </div>
                        {activeTab === 'new' && (
                          <button 
                            className="archive-btn"
                            onClick={() => handleArchiveNotification(notification._id)}
                            title="Archive notification"
                          >
                            <i className="fa-regular fa-bookmark"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-notifications">
                    <p>No {activeTab} notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;