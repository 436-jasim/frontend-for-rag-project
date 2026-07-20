import axios from "axios";

// Base URL for the API gateway
const API_BASE_URL = "http://127.0.0.1:8001";

// Helper to construct Auth headers with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// ---------------------------------------------------
// Authentication API Calls
// ---------------------------------------------------

export const signupUser = async (username, email, password) => {
  const res = await axios.post(`${API_BASE_URL}/auth/signup`, {
    username,
    email,
    password,
  });
  return res.data;
};

export const loginUser = async (username, password) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, {
    username,
    password,
  });

  if (res.data.access_token) {
    localStorage.setItem("token", res.data.access_token);
  }
  if (res.data.user_id) {
    localStorage.setItem("user_id", res.data.user_id);
  }
  if (res.data.session_id) {
    localStorage.setItem("session_id", res.data.session_id);
  }
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await axios.get(`${API_BASE_URL}/auth/me`, getAuthHeaders());
  return res.data;
};

// ---------------------------------------------------
// RAG & Chat API Calls
// ---------------------------------------------------

export const uploadDocument = async (file, sessionId) => {
  const formData = new FormData();
  formData.append("file", file);
  if (sessionId) {
    formData.append("session_id", sessionId);
  }

  const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      ...getAuthHeaders().headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadImage = async (file, sessionId) => {
  const formData = new FormData();
  formData.append("file", file);
  if (sessionId) {
    formData.append("session_id", sessionId);
  }

  const res = await axios.post(`${API_BASE_URL}/img_upload`, formData, {
    headers: {
      ...getAuthHeaders().headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const createChatSession = async (userId, title = "New Laptop Search") => {
  const res = await axios.post(
    `${API_BASE_URL}/chat-session`,
    { user_id: userId, title },
    getAuthHeaders()
  );
  return res.data;
};

export const getChatSessions = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/chat-sessions`, {
    params: { user_id: userId },
    headers: { ...(getAuthHeaders().headers || {}) },
  });
  return res.data.sessions || [];
};

export const deleteChatSession = async (userId, sessionId) => {
  const res = await axios.post(
    `${API_BASE_URL}/chat-session/delete`,
    { user_id: userId, session_id: sessionId },
    getAuthHeaders()
  );
  return res.data;
};

export const askQuestion = async (message, sessionId, userId) => {
  const res = await axios.post(
    `${API_BASE_URL}/chat`,
    {
      message: message,
      session_id: sessionId,
      user_id: userId,
    },
    getAuthHeaders()
  );

  return res.data.answer;
};

export const getMessages = async (sessionId) => {
  const res = await axios.get(`${API_BASE_URL}/messages`, {
    params: { session_id: sessionId },
    headers: { ...(getAuthHeaders().headers || {}) },
  });
  return res.data.messages;
};

export const resetToDefaultGlobalContext = async () => {
  const res = await axios.post(`${API_BASE_URL}/reset-to-default`);
  return res.data;
};