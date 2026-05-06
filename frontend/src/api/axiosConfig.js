import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Add a request interceptor to attach the dummy user ID
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      config.headers['X-User-Id'] = user.id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
