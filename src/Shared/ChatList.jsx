import React, { useState, useEffect, useRef } from 'react';
import '../Styles/ChatList.css';
import avatar from '../Constants/avatar.jpg';
import useUserStore from '../store/useUserStore.js';
import { useNavigate, useParams } from 'react-router-dom';
import { MdOutlineClose } from "react-icons/md";

const ChatList = ({ width = "100%" }) => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  
  const { 
    currentUser, 
    chatWithUsers = [],
    fetchCurrentUser, 
    addToChatWith,
    handleSelectChat,
    selectedChat,
    setSelectedChat
  } = useUserStore();
  
  // console.log("Current User", currentUser);
  // console.log("Selected Chat", selectedChat);
  // console.log("Chat ID from URL", chatId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    userId: null 
  });
  const searchRef = useRef(null);

  // console.log("contextMenu userId:", contextMenu);
  // console.log("User entry:", users);
  // console.log("chatWithUsers:", JSON.stringify(chatWithUsers, null, 2));

  useEffect(() => {
    if (chatId && chatId !== selectedChat) {
      setSelectedChat(chatId);
    }
  }, [chatId, selectedChat, setSelectedChat]);

  useEffect(() => {
    // console.log("Fetching current user on mount");
    fetchCurrentUser();
    
    const savedPinnedChats = localStorage.getItem('pinnedChats');
    if (savedPinnedChats) {
      try {
        setPinnedChats(JSON.parse(savedPinnedChats));
      } catch (e) {
        console.error('Error parsing pinned chats from localStorage:', e);
      }
    }
  }, []);

  // useEffect(() => {
  //   console.log("Current chatWithUsers:", chatWithUsers);
  // }, [chatWithUsers]);

  useEffect(() => {
    const refreshTimer = setTimeout(() => {
      if (!loading) {
        fetchCurrentUser();
      }
    }, 5000);

    return () => clearTimeout(refreshTimer);
  }, [loading]);

  // useEffect(() => {
  //   localStorage.setItem('pinnedChats', JSON.stringify(pinnedChats));
  // }, [pinnedChats]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      // console.log("response",response)
      if (!response.ok) {
        throw new Error(`Failed to fetch users (Status: ${response.status})`);
      }

      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToChatWith = async (user) => {
    try {
      if (!currentUser) return;
      
      // console.log("Adding user to chat:", user);
      await addToChatWith(currentUser._id, user._id, navigate);
      setSearchTerm('');
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error adding to chatWith:', error);
      setError(error.message);
    }
  };

  const handlePinChat = (userId) => {
    setPinnedChats(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [userId, ...prev]
    );
    setContextMenu({ visible: false, x: 0, y: 0, userId: null });
  };

  const handleRightClick = (e, userId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      userId,
    });
  };

  const closeContextMenu = () => {
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0, userId: null });
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
  }, [contextMenu.visible]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() !== '') {
      if (users.length === 0) {
        fetchAllUsers();
      }
      
      const filtered = users.filter(user => 
        user?.name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredUsers([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user, e) => {
    if (e) e.stopPropagation();
    handleAddToChatWith(user);
  };

  useEffect(() => {
    if (chatId && chatId !== selectedChat) {
      setSelectedChat(chatId);
    }
  }, [chatId]);

  const handleUserClick = (chatUser) => {
    const user = chatUser.userId;

    handleSelectChat(
      user._id,
      {
        _id: user._id,
        name: user.name,
        avatar: user.avatar?.url || avatar
      },
      navigate
    );
  };

  const sortedUsers = Array.isArray(chatWithUsers) ? [
    ...pinnedChats
      .map(id => chatWithUsers.find(user => user && user.userId === id))
      .filter(Boolean),
    ...chatWithUsers
      .filter(user => user && user.userId && !pinnedChats.includes(user.userId))
  ] : [];

  const handleCloseChat = () => {
    setSelectedChat(null);
    navigate("/");
  };

  return (
    <div className="chat-list" style={{ width }} onClick={closeContextMenu}>
      <div className="header">
        <h2>Chats</h2>
      </div>

      <div className="search-container" ref={searchRef}>
        <div className="search-bar">
          <input
            type="text"
            id="search"
            placeholder="Search users"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.trim() !== '' && setShowSuggestions(true)}
          />
          {loading && <span className="loading-spinner">Loading...</span>}
        </div>
        
        {showSuggestions && (
          <div className="search-suggestions">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="suggestion-item"
                  onClick={(e) => handleSuggestionClick(user, e)}
                >
                  <img src={user.avatar?.url || avatar} alt={user.name} className="suggestion-avatar" />
                  <span>{user.name}</span>
                </div>
              ))
            ) : (
              <div className="suggestion-item no-results">No users found</div>
            )}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-list">
        {sortedUsers.length > 0 ? (
          sortedUsers
          .filter(user => user && user.userId)
          .map((user) => (
            <div 
              className={`user ${user.userId === selectedChat ? 'selected' : ''}`}
              key={`${user.userId}-${user.name}`}
              onContextMenu={(e) => handleRightClick(e, user.userId._id)}
              onClick={() => handleUserClick(user)}
            >
              <div className="user-btn">
                <button className="user-button">
                  <img src={user.userId.avatar.url || avatar} alt="Avatar" />
                  <span>{user?.name || "User"}</span>
                  {pinnedChats.includes(user.userId) && (
                    <i className="pin-icon fa-solid fa-thumbtack pinned"></i>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users">
            {loading ? 'Loading...' : 'Search for users to start chatting!'}
          </div>
        )}
      </div>

      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => handlePinChat(contextMenu.userId)}>
            <div style={{width:"100%", display:"flex", justifyContent:"center", alignItems:"center"}}>
              <i className="fa-solid fa-thumbtack"></i> 
              {pinnedChats.includes(contextMenu.userId) ? 'Unpin' : 'Pin to top'}
            </div>
          </button>
          {contextMenu.userId === selectedChat && (
            <button onClick={handleCloseChat}>
              <div style={{width:"100%", display:"flex", justifyContent:"center", alignItems:"center"}}>
                <MdOutlineClose style={{fontSize:"18px"}}/><span>Close Chat</span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;
