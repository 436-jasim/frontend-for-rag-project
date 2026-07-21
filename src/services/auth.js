import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------
// Authentication Helpers
// ---------------------------------------------------

export const login = async (username, password) => {
  const response = await axios.post(`${API}/auth/login`, {
    username: username,
    password: password,
  });

  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user_id", response.data.user_id || response.data.session_id);
    localStorage.setItem("session_id", response.data.session_id || response.data.user_id);
    localStorage.setItem("username", username);
  }

  return response.data;
};

export const signup = async (username, email, password) => {
  const response = await axios.post(`${API}/auth/signup`, {
    username: username,
    email: email,
    password: password,
  });

  if (response.data?.status === "success") {
    localStorage.setItem("username", username);
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("current_chat_session_id");
  localStorage.removeItem("username");
};