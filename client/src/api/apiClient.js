import axios from "axios";

const TOKEN_KEY = "velora_auth_token";
const API_PREFIX = "/api";

const normalizeApiBaseUrl = (value) => {
  if (typeof value !== "string") {
    return API_PREFIX;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return API_PREFIX;
  }

  const normalizedValue = trimmedValue.replace(/\/+$/, "");

  if (!normalizedValue || normalizedValue === "/") {
    return API_PREFIX;
  }

  return normalizedValue.endsWith(API_PREFIX)
    ? normalizedValue
    : `${normalizedValue}${API_PREFIX}`;
};

export const apiClient = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject(error);
  }
);

export const authStorage = {
  getToken() {
    return window.localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    }

    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export const getApiErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || error?.message || fallback;
