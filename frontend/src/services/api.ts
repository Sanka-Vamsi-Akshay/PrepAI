import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for automatic HTTP-Only cookie transfer
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Response Interceptor: Centralized success and error formatting
apiClient.interceptors.response.use(
  (response) => {
    // Return the standard API response structure
    return response;
  },
  (error: AxiosError) => {
    const responseData: any = error.response?.data;
    const message = responseData?.message || 'An unexpected error occurred';
    const errors = responseData?.errors;

    // Flush credentials if server rejects request as unauthorized
    if (error.response?.status === 401) {
      // Clean local storage if any, though auth is cookie-driven
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      errors,
      originalError: error,
    });
  }
);
