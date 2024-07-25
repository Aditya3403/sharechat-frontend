import React from 'react';
import '../Styles/ChatList.css';
import avatar from '../Constants/avatar.jpg';
import { Link } from 'react-router-dom';

const ChatList = ({ width = "100%", chats = [], chatId, onlineUsers = [], newMessageAlert = [{ chatId: "1", count: 0 }], handleDeleteChat }) => {
  return (
    <div className="chat-list">
      <div className='header'>
        <h2>Chats</h2>
        <a href="/groups"><i className="fa-solid fa-user-group fa-sm"></i></a>
      </div>
      
      <div className="search-bar">
        <input type="text" id="search" placeholder="Search users" />
      </div>
      
      {chats?.map((data, index) => {
        return (
          <div className="user" key={index}>
            <Link to={`/chat/${data.id || chatId}`} className="user-btn">
              <button className="user-button">
                <img src={avatar} alt="Avatar" />
                <span>User {data.name}</span>
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default ChatList;
