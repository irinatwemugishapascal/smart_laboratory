import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const experimentAPI = {
  getAll: (params) => api.get('/experiments', { params }),
  getById: (id) => api.get(`/experiments/${id}`),
  submitResult: (data) => api.post('/experiments/submit', data),
  getResults: () => api.get('/experiments/results'),
  getResultById: (id) => api.get(`/experiments/results/${id}`),
  getSubjectStats: () => api.get('/experiments/stats/subjects'),
  getProgressOverTime: () => api.get('/experiments/progress/timeline'),
  calculatePhysics: (type, data) => api.post('/experiments/calculate/physics', { type, data }),
  calculateChemistry: (type, data) => api.post('/experiments/calculate/chemistry', { type, data }),
  calculateBiology: (type, data) => api.post('/experiments/calculate/biology', { type, data }),
  getVideos: (subject) => api.get('/experiments/videos', { params: { subject } }),
  getChemicals: (category) => api.get('/experiments/chemicals', { params: { category } }),
  simulateReaction: (chemical1, chemical2) => api.post('/experiments/simulate-reaction', { chemical1, chemical2 })
};

export const dashboardAPI = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getTeacherDashboard: () => api.get('/dashboard/teacher'),
  getLeaderboard: (limit) => api.get('/dashboard/leaderboard', { params: { limit } })
};

export const aiAPI = {
  explainResult: (data) => api.post('/ai/explain', data),
  getSuggestion: () => api.post('/ai/suggestion'),
  chat: (message, history) => api.post('/ai/chat', { message, history }),
  summarizeVideo: (data) => api.post('/ai/summarize-video', data)
};

export const badgeAPI = {
  getAll: () => api.get('/badges'),
  getMyBadges: () => api.get('/badges/my-badges'),
  getUserBadges: (userId) => api.get(`/badges/user/${userId}`),
  awardBadge: (userId, badgeId) => api.post('/badges/award', { userId, badgeId }),
  removeBadge: (userId, badgeId) => api.post('/badges/remove', { userId, badgeId }),
  createBadge: (data) => api.post('/badges', data),
  updateBadge: (id, data) => api.put(`/badges/${id}`, data),
  deleteBadge: (id) => api.delete(`/badges/${id}`)
};

export default api;
