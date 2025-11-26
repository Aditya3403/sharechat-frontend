import React, { useState, useEffect, useMemo, useRef } from "react";
import "../Styles/Chat.css";
import { io } from "socket.io-client";
import AppLayout from "../layout/AppLayout";
import { IoMdSend } from "react-icons/io";
import useUserStore from '../store/useUserStore';
import { useParams } from "react-router-dom";
import { FiPaperclip } from "react-icons/fi";
import { MdOutlinePhoto } from "react-icons/md";

const Chat = () => {
  const { chatId } = useParams();
  
  const {
    currentUser,
    otherUser,
    selectedChat,
    fetchOtherUser,
    fetchChatMessages,
    setSelectedChat,
    addUserToChatList
  } = useUserStore();
  console.log("Other user:",otherUser)

  useEffect(() => {
    if (chatId && chatId !== selectedChat) {
      setSelectedChat(chatId);
    }
  }, [chatId, selectedChat, setSelectedChat]);
  
  const [socketId, setSocketId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);

  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setSelectedImage(file);
  setImagePreviewUrl(URL.createObjectURL(file));
  setIsAttachmentOpen(false);
};

  const socket = useMemo(() => {
    const s = io(process.env.REACT_APP_BACKEND_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
      setSocketId(s.id);
      if (currentUser?._id) {
        s.emit("register-user", currentUser._id);
      }
    });

   s.on("receive-message", async (data) => {
      if (data.chatId !== activeChatId) return;
      
      if (data.sender === currentUser._id) return;

      await addUserToChatList(data.sender);

      setMessages(prev => [
        ...prev,
        {
          text: data.message,
          sender: data.sender,
          timestamp: new Date(data.timestamp),
          isOwnMessage: false
        }
      ]);
    });


   s.on("receive-image", ({ msg, media }) => {
      if (msg.sender === currentUser._id) return;
      setMessages(prev => [
        ...prev,
        {
          sender: msg.sender,
          text: "",
          imageUrl: media.url,
          timestamp: msg.time ? new Date(msg.time) : new Date(),
          isOwnMessage: false
        }
      ]);
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    s.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return s;
  }, [currentUser, chatId, selectedChat]);


  const groupMessagesByDate = (messages) => {
    const grouped = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(message);
    });
    
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

 useEffect(() => {
  const initializeChat = async () => {
    const activeChatId = chatId || selectedChat;
    
    if (!activeChatId || !currentUser) {
      console.log("Missing chat ID or current user");
      return;
    }
    
    console.log("Initializing chat with ID:", activeChatId);
    
    try {
      setLoading(true);
      setMessages([]);
      
      if (!otherUser || otherUser._id !== activeChatId) {
        await fetchOtherUser(activeChatId);
      }
      
      const messagesData = await fetchChatMessages(currentUser._id, activeChatId);
      console.log("Fetched messages:", messagesData);
      
      if (Array.isArray(messagesData)) {
        setMessages(messagesData.map(msg => ({
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp || msg.time,
          imageUrl: msg.mediaUrl || null,     // <-- ADD THIS
          isOwnMessage: msg.sender === currentUser._id
        })));

      } else {
        console.error("Expected array of messages but got:", messagesData);
      }
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError("Failed to initialize chat: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  initializeChat();

  return () => {
    if (socket && socket.connected) {
      console.log("Disconnecting socket");
      socket.disconnect();
    }
  };
}, [chatId, selectedChat, currentUser, fetchOtherUser, fetchChatMessages, otherUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
  e.preventDefault();

  const activeChatId = chatId || selectedChat;
  if (!activeChatId || !currentUser) return;

  if (selectedImage) {

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("userId", currentUser._id);
    formData.append("otherUserId", activeChatId);
    formData.append("chatId", activeChatId);

    try {
      const response = await fetch("http://localhost:3000/chat/send-image", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      console.log("Image sent:", data);

      const { message, media } = data;

      setMessages(prev => [
        ...prev,
        {
          ...message,
          imageUrl: media.url,
          timestamp: new Date(),
          isOwnMessage: true
        }
      ]);


      socket.emit("send-image", {
        sender: currentUser._id,
        receiver: activeChatId,
        chatId: activeChatId,
        imageUrl: media.url
      });


      setSelectedImage(null);
      setImagePreviewUrl(null);
      setMessage("");

      return;

    } catch (err) {
      console.error("Image message failed:", err);
      return;
    }
  }

  if (message.trim()) {
    const timestamp = new Date().toISOString();
    const tempId = Date.now();

    setMessages(prev => [
      ...prev,
      {
        _id: tempId,
        text: message,
        sender: currentUser._id,
        timestamp,
        isOwnMessage: true,
      }
    ]);

    socket.emit("send-message", {
      sender: currentUser._id,
      receiver: activeChatId,
      message,
      timestamp
    });

    setMessage("");
  }
};


  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes.toString().padStart(2, "0");
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatDateHeader = (dateString) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const date = new Date(dateString);
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    
    return dateString;
  };

  const activeChatId = chatId || selectedChat;

  const activeChatRef = useRef(activeChatId);
  useEffect(()=>{
    activeChatRef.current = activeChatId;
  }, [activeChatId]);
  
  const getUserInitial = () => {
    if (otherUser?.name) {
      return otherUser.name.charAt(0).toUpperCase();
    }
  };

  useEffect(() => {
  const savedUser = localStorage.getItem("selectedChatUser");
  if (savedUser) {
    useUserStore.getState().setOtherUser(JSON.parse(savedUser));
  }
}, []);


  return (
    <div className="chat-area">
      {error && <div className="error-message">{error}</div>}
      
      {activeChatId ? (
        <>
          <div className="chat-header">
            {otherUser?.avatar ? (
              <img 
                src={otherUser.avatar} 
                alt={otherUser.name} 
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar-placeholder">
                {getUserInitial()}
              </div>
            )}
            <h3>{otherUser?.name || 'Loading...'}</h3>
          </div>
          <div className="chat-messages">
            {loading ? (
              <div className="loading-messages">Loading messages...</div>
            ) : Object.keys(groupedMessages).length > 0 ? (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="message-date-group">
                  <div className="date-divider">
                    <span>{formatDateHeader(date)}</span>
                  </div>
                  {dateMessages.map((msg, index) => (
                    <div
                      className={`message-container ${msg.isOwnMessage ? "own-message" : "other-message"}`}
                      key={msg._id || index}
                    >
                      <div className={`message-bubble ${msg.isOwnMessage ? "outgoing" : "incoming"}`}>
                        <div className="message-content">
                          <div className="message-content">
                            {msg.imageUrl || msg.mediaUrl ? (
                              <img
                                src={msg.imageUrl || msg.mediaUrl}
                                className="chat-img"
                              />
                            ) : (
                              <p>{msg.text}</p>
                            )}


                            <span className="timestamp">
                              {formatTime(msg.timestamp || msg.time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="no-messages">
                No messages yet. Start your conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

         {imagePreviewUrl && (
            <div className="image-preview-popup">
              <div className="image-preview-header">
                <button
                  className="close-preview"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreviewUrl(null);
                  }}
                >
                  ✖
                </button>
              </div>

              <div className="image-preview-body">
                <img src={imagePreviewUrl} alt="preview" />
              </div>

              {/* <div className="image-preview-caption">
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div> */}
            </div>
          )}


          <form onSubmit={handleSendMessage} className="message-box">
            <div className="attachment-wrapper">
              <button
                type="button"
                className="clip-btn"
                onClick={() => setIsAttachmentOpen(prev => !prev)}
              >
                <FiPaperclip />
              </button>

              {isAttachmentOpen && (
                <div className="attachment-menu">
                  <label className="attachment-item">
                    <div className="send-image"><MdOutlinePhoto style={{fontSize:"22px"}}/> Share Photo</div>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
            </div>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={loading || !activeChatId}
            />
            <button 
              type="submit" 
              disabled={loading || (!message.trim() && !selectedImage) || !activeChatId}
            >

              <IoMdSend style={{fontSize:"18px", backgroundColor:"none"}}/>
            </button>
          </form>

        </>
      ) : (
        <div className="no-chat-selected">
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default AppLayout()(Chat);
