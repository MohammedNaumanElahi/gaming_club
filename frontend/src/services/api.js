import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is important for sending cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Auth API
// --------------------
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (username, email, password) =>
    api.post("/auth/register", { username, email, password }),
  getProfile: () => api.get("/auth/me"),
};

// --------------------
// Games API
// --------------------
export const gamesAPI = {
  getGames: () => api.get("/games"),
  getGame: (id) => api.get(`/games/${id}`),
  createGame: (gameData) => api.post("/games", gameData),
  updateGame: (id, gameData) => api.put(`/games/${id}`, gameData),
  deleteGame: (id) => api.delete(`/games/${id}`),
};

// --------------------
// Achievements API
// --------------------
export const achievementsAPI = {
  getAchievements: (gameId) => api.get(`/achievements/${gameId}`),
  getAchievement: (id) => api.get(`/achievements/achievement/${id}`),
  createAchievement: (achievementData) => api.post("/achievements", achievementData),
  updateAchievement: (id, achievementData) => api.put(`/achievements/${id}`, achievementData),
  deleteAchievement: (id) => api.delete(`/achievements/${id}`),
  searchAchievements: (gameId, keyword) => api.get(`/achievements/search/${gameId}`, { params: { keyword } }),
};

// --------------------
// Chatbot API
// --------------------
export const chatbotAPI = {
  getTip: async (question) => {
    try {
      const response = await api.post("/chatbot", { question });
      return response.data;
    } catch (error) {
      console.error("Chatbot API error:", error);
      throw error;
    }
  },
};

// Default export (axios instance)
export default api;
