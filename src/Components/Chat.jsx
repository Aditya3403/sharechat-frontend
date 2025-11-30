import React, { useState, useEffect, useRef } from "react";
import "../Styles/Chat.css";
import { io } from "socket.io-client";
import AppLayout from "../layout/AppLayout";
import { IoMdSend } from "react-icons/io";
import useUserStore from "../store/useUserStore";
import { useParams } from "react-router-dom";
import { FiPaperclip } from "react-icons/fi";
import { MdOutlinePhoto } from "react-icons/md";

const Chat = () => {
  const { chatId } = useParams();

  const {
    currentUser,
    otherUser,
    fetchOtherUser,
    fetchChatMessages,
    selectedChat,
    setSelectedChat,
  } = useUserStore();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);

  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const activeChatId = chatId || selectedChat;

  useEffect(() => {
  const saved = localStorage.getItem("selectedChatUser");
  if (saved) {
    useUserStore.getState().setOtherUser(JSON.parse(saved));
  }
}, []);


  useEffect(() => {
    if (chatId && chatId !== selectedChat) {
      setSelectedChat(chatId);
    }
  }, [chatId, selectedChat, setSelectedChat]);

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_BACKEND_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    socket.current.on("connect", () => {
      if (currentUser?._id) {
        socket.current.emit("register-user", currentUser._id);
      }
    });

    // incoming text
    socket.current.on("receive-message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: data.sender,
          text: data.message,
          timestamp: data.timestamp,
          isOwnMessage: false,
        },
      ]);
    });

    // incoming image
    socket.current.on("receive-image", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: data.sender,
          text: "",
          mediaUrl: data.mediaUrl,
          timestamp: data.time,
          isOwnMessage: false,
        },
      ]);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (activeChatId && socket.current) {
      socket.current.emit("join-chat", activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    const init = async () => {
      if (!currentUser || !activeChatId) return;

      try {
        setLoading(true);

        if (!otherUser || otherUser._id !== chatId) {
          await fetchOtherUser(chatId);
          localStorage.setItem(
            "selectedChatUser",
            JSON.stringify(useUserStore.getState().otherUser)
          );
        }

        const msgs = await fetchChatMessages(currentUser._id, chatId);
        if (Array.isArray(msgs)) {
          setMessages(
            msgs.map((m) => ({
              text: m.text,
              sender: m.sender,
              mediaUrl: m.mediaUrl || null,
              timestamp: m.timestamp || m.time,
              isOwnMessage: m.sender === currentUser._id,
            }))
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [chatId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDateHeader = (dateKey) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const target = new Date(dateKey);

  if (target.toDateString() === today.toDateString()) return "Today";
  if (target.toDateString() === yesterday.toDateString()) return "Yesterday";

  return dateKey;
};

  const groupMessagesByDate = (messages) => {
    const grouped = {};

    messages.forEach((m) => {
      const date = new Date(m.timestamp);
      const key = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const handleImageUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setSelectedImage(f);
    setImagePreviewUrl(URL.createObjectURL(f));
    setIsAttachmentOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentUser || !activeChatId) return;

    if (selectedImage) {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("image", selectedImage);
      fd.append("userId", currentUser._id);
      fd.append("otherUserId", activeChatId);
      fd.append("chatId", activeChatId);

      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat/send-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        const data = await res.json();
        const mediaUrl = data.mediaUrl;

        setMessages((prev) => [
          ...prev,
          {
            sender: currentUser._id,
            mediaUrl,
            text: "",
            timestamp: new Date(),
            isOwnMessage: true,
          },
        ]);

        socket.current.emit("send-image", {
          sender: currentUser._id,
          receiver: activeChatId,
          chatId: activeChatId,
          mediaUrl,
        });

        setSelectedImage(null);
        setImagePreviewUrl(null);

      } catch (e) {
        console.log("send image err:", e);
      }
      return;
    }


    if (message.trim()) {
      const time = new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        {
          sender: currentUser._id,
          text: message,
          timestamp: time,
          isOwnMessage: true,
        },
      ]);

      socket.current.emit("send-message", {
        sender: currentUser._id,
        receiver: activeChatId,
        message,
        chatId: activeChatId,
        timestamp: time,
      });

      setMessage("");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const h = d.getHours() % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = d.getHours() >= 12 ? "PM" : "AM";
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div className="chat-area">
      {activeChatId ? (
        <>
          {/* HEADER */}
          <div className="chat-header">
            {otherUser?.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                {otherUser?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <h3>{otherUser?.name || "Loading..."}</h3>
          </div>

          <div className="chat-messages">
            {loading ? (
              <div className="loading-messages">Loading messages...</div>
            ) : (
              Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date} className="message-date-group">
                  <div className="date-divider"><span>{formatDateHeader(date)}</span></div>

                  {msgs.map((msg, i) => (
                    <div
                      className={`message-container ${
                        msg.isOwnMessage ? "own-message" : "other-message"
                      }`}
                      key={i}
                    >
                      <div
                        className={`message-bubble ${
                          msg.isOwnMessage ? "outgoing" : "incoming"
                        }`}
                      >
                        {msg.mediaUrl ? (
                          <>
                            <img src={msg.mediaUrl} className="chat-img" alt="Shared content" />
                            {msg.text && <p>{msg.text}</p>}
                          </>
                        ) : (
                          <p>{msg.text}</p>
                        )}
                        <span className="timestamp">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* IMAGE PREVIEW */}
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
                <img src={imagePreviewUrl} alt="Preview" />
              </div>
            </div>
          )}

          {/* INPUT */}
          <form onSubmit={handleSendMessage} className="message-box">
            <div className="attachment-wrapper">
              <button
                type="button"
                className="clip-btn"
                onClick={() => setIsAttachmentOpen((p) => !p)}
              >
                <FiPaperclip />
              </button>

              {isAttachmentOpen && (
                <div className="attachment-menu">
                  <label className="attachment-item">
                    <div className="send-image">
                      <MdOutlinePhoto style={{ fontSize: "22px" }} /> Share Photo
                    </div>
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
            />

            <button type="submit" disabled={!message.trim() && !selectedImage}>
              <IoMdSend style={{ fontSize: "18px" }} />
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
