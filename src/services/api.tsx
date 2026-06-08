import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://localhost:7198/', // ✅ đúng API
  withCredentials: true, // ✅ gửi cookie
});

// ❌ XÓA interceptor request (không cần token header)

// Interceptor response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;