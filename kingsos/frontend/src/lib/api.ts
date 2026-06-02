import axios from "axios";

function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined") {
    const hostname =
      window.location.hostname === "0.0.0.0"
        ? "127.0.0.1"
        : window.location.hostname;

    return `${window.location.protocol}//${hostname}:8000`;
  }

  return "http://127.0.0.1:8000";
}

export const API_BASE_URL =
  getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function setAuthToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
}

export function clearStoredAuth() {
  clearAuthToken();

  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("kingsos_access_token");
  localStorage.removeItem("kingsos_user");
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function isNetworkError(error: unknown) {
  return axios.isAxiosError(error) && !error.response;
}

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "msg" in item &&
          typeof item.msg === "string"
        ) {
          return item.msg;
        }

        return null;
      })
      .filter((item): item is string => item !== null)
      .join(" ");
  }

  return null;
}

export function getStoredAuthToken() {
  return (
    localStorage.getItem("kingsos_access_token") ?? localStorage.getItem("token")
  );
}

export function loadStoredAuthToken() {
  const token = getStoredAuthToken();

  if (token) {
    setAuthToken(token);
  } else {
    clearAuthToken();
  }

  return token;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isUnauthorizedError(error)) {
      clearStoredAuth();
    }

    return Promise.reject(error);
  }
);
