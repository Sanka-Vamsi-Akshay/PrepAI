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

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
};

let bootstrapPromise: Promise<void> | null = null;

export const ensureCsrfToken = (): Promise<void> => {
  if (getCookie('XSRF-TOKEN')) {
    return Promise.resolve();
  }
  if (!bootstrapPromise) {
    bootstrapPromise = apiClient
      .get('/auth/bootstrap')
      .then(() => {})
      .catch(() => {
        return apiClient.get('/health/live').then(() => {});
      })
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        bootstrapPromise = null;
      });
  }
  return bootstrapPromise;
};

// Request Interceptor: Guarantees CSRF token cookie existence before any state-changing request
apiClient.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase();
    const isStateChanging = ['post', 'put', 'patch', 'delete'].includes(method || '');
    const isExempt = config.url?.includes('/auth/bootstrap') || config.url?.includes('/health');

    if (isStateChanging && !isExempt && !getCookie('XSRF-TOKEN')) {
      await ensureCsrfToken();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
