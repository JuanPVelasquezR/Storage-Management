import axios from "axios";
import { env } from "./env";
import { getToken } from "./auth";

export const api = axios.create({
  baseURL: `${env.apiBaseUrl}/api`,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

