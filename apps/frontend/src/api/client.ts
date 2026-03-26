import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 失效，清除本地存储并跳转登录
      localStorage.removeItem('clawbook-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
