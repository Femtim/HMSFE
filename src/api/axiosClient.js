import axios from 'axios';

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || 'https://hmsbe-60h6.onrender.com/api/v1';

const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '').endsWith('/api/v1')
  ? rawBaseUrl.replace(/\/$/, '')
  : `${rawBaseUrl.replace(/\/$/, '')}/api/v1`;

const axiosClient = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hospital_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (
        !url.includes('/auth/login') &&
        !url.includes('/auth/update-password') &&
        !url.includes('/auth/delete-account')
      ) {
        localStorage.removeItem('hospital_token');
        localStorage.removeItem('hospital_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;