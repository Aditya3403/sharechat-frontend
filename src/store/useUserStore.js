import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
// console.log("ENV:", process.env.REACT_APP_BACKEND_URL);

const useUserStore = create((set, get) => ({

  currentUser: null,
  otherUser: null,
  selectedChat: null,
  chatWithUsers: [],
  
  isFetchingUser: false,
  isFetchingChat: false,

  userError: null,
  setOtherUser: (userData) => set({ otherUser: userData }),

  setSelectedChat: (userId, userData) => {
    if (!userId) return;
    const chatId = typeof userId === 'object' ? userId._id : userId;
    set({ 
      selectedChat: chatId,
      otherUser: userData || get().otherUser
    });
  },
  
  handleSelectChat: (userId, userData, navigate) => {
    const chatId = typeof userId === 'object' ? userId._id : userId;

    set({
      selectedChat: chatId,
      otherUser: userData || get().otherUser
    });

    if (userData) {
      localStorage.setItem("selectedChatUser", JSON.stringify(userData));
    }

    if (navigate) navigate(`/chat/${chatId}`);

    const { currentUser } = get();
    if (currentUser) {
      get().fetchChatMessages(currentUser._id, chatId);
    }
  },

  fetchCurrentUser: async () => {
    set({ isFetchingUser: true, userError: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const chatWithData = response.data.chatWith || [];
      
      set({ 
        currentUser: response.data,
        chatWithUsers: chatWithData,
        isFetchingUser: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        userError: error.response?.data?.message || error.message,
        isFetchingUser: false 
      });
      throw error;
    }
  },
  
  fetchOtherUser: async (userId) => {
    if (!userId) return;
    
    set({ isFetchingUser: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      set({ 
        otherUser: response.data,
        isFetchingUser: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        userError: error.response?.data?.message || error.message,
        isFetchingUser: false 
      });
      return null;
    }
  },
  
  fetchChatMessages: async (currentUserId, otherUserId) => {
    if (!currentUserId || !otherUserId) return [];
    
    set({ isFetchingChat: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/chat/messages/user/${currentUserId}/${otherUserId}`, 
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      
      const transformedMessages = response.data.map(msg => ({
        ...msg,
        text: msg.text || msg.message,
        isOwnMessage: msg.sender.toString() === currentUserId,
        timestamp: msg.time || msg.timestamp,
        mediaUrl: msg.mediaUrl
      }));
      
      set({ isFetchingChat: false });
      console.log("Transformed Message", transformedMessages)
      return transformedMessages;
    } catch (error) {
      set({ 
        userError: error.response?.data?.message || error.message,
        isFetchingChat: false 
      });
      return [];
    }
  },

  sendMessage: async (senderId, receiverId, message) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/chat/messages`,
        { userId: senderId, otherUserId: receiverId, message },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addToChatWith: async (currentUserId, otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/user/add-to-chatwith`, {
        userId: currentUserId,
        otherUserId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await get().fetchCurrentUser();

      return true;
    } catch (error) {
      set({ userError: error.response?.data?.message || error.message });
      throw error;
    }
  },

  addUserToChatList: async (userId) => {
    const { chatWithUsers, fetchCurrentUser } = get();

    if (chatWithUsers.some(u => u.userId === userId)) return;

    await fetchCurrentUser();
  },

  clearUser: () => set({ 
    currentUser: null,
    otherUser: null,
    selectedChat: null,
    chatWithUsers: [],
    userError: null
  })
}));

export default useUserStore;
