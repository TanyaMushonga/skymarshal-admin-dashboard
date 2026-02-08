import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { getSession } from "next-auth/react";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
export interface DjangoError {
  detail?: string;
  non_field_errors?: string[] | string;
  message?: string;
  [key: string]: string[] | string | any;
}

export class ApiError extends Error {
  status: number;
  data: DjangoError;

  constructor(status: number, data: DjangoError) {
    let message = "An unexpected error occurred";

    if (data.detail) {
      message = data.detail;
    } else if (data.message) {
      message = data.message;
    } else if (data.non_field_errors) {
      message = Array.isArray(data.non_field_errors)
        ? data.non_field_errors[0]
        : data.non_field_errors;
    } else if (typeof data === "object" && data !== null) {
      // If we have field-specific errors, grab the first one
      const values = Object.values(data);
      if (values.length > 0) {
        const firstError = values[0];
        message = Array.isArray(firstError) ? firstError[0] : firstError;
      }
    }

    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * CLIENT-SIDE API Client
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    if (session?.error === "RefreshAccessTokenError") {
      if (typeof window !== "undefined") {
        window.location.href = "/login?expired=true";
      }
    }
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    // Automatically handle FormData content-type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login?expired=true";
      } else {
        // This will throw a NEXT_REDIRECT error that Next.js handles
        redirect("/login?expired=true");
      }
    }

    if (error.response) {
      const apiError = new ApiError(
        error.response.status,
        error.response.data as DjangoError,
      );

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          // Client-side: redirect using window.location
          window.location.href = "/login?expired=true";
        } else {
          // Server-side: use Next.js redirect, which throws an error
          redirect("/login?expired=true");
        }
        // If we reach here on the client, we've redirected.
        // If we reach here on the server, `redirect` has already thrown.
        // In either case, we don't want to throw apiError here.
        return Promise.reject(error); // Or just return, as the redirect will handle it.
      }

      // For other errors, display a toast on the client and throw ApiError
      if (typeof window !== "undefined") {
        toast.error(apiError.message);
      }

      throw apiError;
    }
    return Promise.reject(error);
  },
);

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
