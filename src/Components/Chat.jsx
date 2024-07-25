import React, { useState, useEffect, useMemo } from 'react';
import '../Styles/Chat.css';
import { io } from 'socket.io-client';
import AppLayout from '../layout/AppLayout';
import { IoMdSend } from "react-icons/io";

const Chat = () => {
  const [socketId, setSocketId] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const socket = useMemo(() => {
    const s = io("http://localhost:3000");
    s.on("connect", () => {
      console.log("Connected", s.id);
      setSocketId(s.id);
    });

    s.on("send-message", (data) => {
      console.log("Received message from server:", data);
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      addMessage(data.message, data.sender, currentTime, data.position);
    });

    return s;
  }, []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') {
      return; // Don't send empty messages
    }
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addMessage(message, socketId, currentTime, 'bottom'); // Send message to the bottom
    socket.emit("message", { message, sender: socketId, position: 'bottom' });
    setMessage('');
  };

  const addMessage = (text, sender, time, position) => {
    const newMessage = { text, sender, time, position };
    setMessages((prevMessages) => {
      if (position === 'top') {
        return [newMessage, ...prevMessages];
      } else {
        return [...prevMessages, newMessage];
      }
    });
  };

  return (
    <div className="chat-area">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div className={`message ${msg.sender === socketId ? 'outgoing' : 'incoming'}`} key={index}>
            <div className="message-content">
              {/* <span className="message-sender">{msg.sender}</span> */}
              <p>{msg.text}</p>
              <span className="message-time">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="message-box">
        <input id="msg" type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message..." />
        <button onClick={handleSendMessage}><IoMdSend /></button>
      </div>
    </div>
  );
};

export default AppLayout()(Chat);
