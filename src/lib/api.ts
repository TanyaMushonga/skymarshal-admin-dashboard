import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

// Environment variables should be used for the base URL in production
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Django Error Interface
 */
export interface DjangoError {
  [key: string]: string[] | string | any;
}

/**
 * Custom Error Class for API Responses
 */
export class ApiError extends Error {
  status: number;
  data: DjangoError;

  constructor(status: number, data: DjangoError) {
    super(data.detail || data.message || "An unexpected error occurred");
    this.status = status;
    this.data = data;
  }
}

/**
 * Global API Client Instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can inject CSRF tokens or other headers here if needed
    // const csrfToken = getCookie('csrftoken');
    // if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor
 */
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Errors (Unauthorized) - Session/Token Refresh Logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the session/token
        // This endpoint should refresh the cookies on the backend
        await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          {},
          { withCredentials: true },
        );

        isRefreshing = false;
        processQueue(null);

        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // If refresh fails, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle Django specific error structures
    if (error.response) {
      const data = error.response.data as DjangoError;
      const status = error.response.status;

      // Map common Django error formats to a flatter structure if needed
      // or just throw with the existing data
      throw new ApiError(status, data);
    }

    return Promise.reject(error);
  },
);

/**
 * API Wrapper Methods
 */
export const api = {
  get: <T>(url: string, config = {}) => apiClient.get<any, T>(url, config),
  post: <T>(url: string, data = {}, config = {}) =>
    apiClient.post<any, T>(url, data, config),
  put: <T>(url: string, data = {}, config = {}) =>
    apiClient.put<any, T>(url, data, config),
  patch: <T>(url: string, data = {}, config = {}) =>
    apiClient.patch<any, T>(url, data, config),
  delete: <T>(url: string, config = {}) =>
    apiClient.delete<any, T>(url, config),
};

export default apiClient;
