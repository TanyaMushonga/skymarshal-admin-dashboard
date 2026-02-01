import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ApiError, DjangoError } from "./api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * SERVER-SIDE API Client (for Server Actions)
 */
const serverApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

serverApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getServerSession(authOptions);

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    // Automatically handle FormData (Multipart) for server-side uploads
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

serverApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const data = error.response.data as DjangoError;
      const status = error.response.status;

      // Special handling for 401 in Server Actions
      if (status === 401) {
        // We throw a specific error that can be caught by 'error.js' or the component
        throw new Error("UNAUTHORIZED_ACCESS");
      }

      throw new ApiError(status, data);
    }
    return Promise.reject(error);
  },
);

export const server = {
  get: <T>(url: string, config = {}) =>
    serverApiClient.get<any, T>(url, config),
  post: <T>(url: string, data = {}, config = {}) =>
    serverApiClient.post<any, T>(url, data, config),
  put: <T>(url: string, data = {}, config = {}) =>
    serverApiClient.put<any, T>(url, data, config),
  patch: <T>(url: string, data = {}, config = {}) =>
    serverApiClient.patch<any, T>(url, data, config),
  delete: <T>(url: string, config = {}) =>
    serverApiClient.delete<any, T>(url, config),
};

export default server;
