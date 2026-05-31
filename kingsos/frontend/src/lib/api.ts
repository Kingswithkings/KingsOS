import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
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
