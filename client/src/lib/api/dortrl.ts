import axios from "axios";

const baseURL =
  import.meta.env.VITE_SERVER_URL?.trim() || "http://localhost:8787";

export const api = axios.create({
  baseURL,
  timeout: 10000,
});
