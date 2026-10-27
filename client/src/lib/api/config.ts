const serverUrl = import.meta.env.VITE_SERVER_URL?.trim();

const fallbackServer = import.meta.env.DEV
  ? "http://localhost:8787"
  : "https://dortrl-api.ekomjahedet.workers.dev";

export const API_BASE = "";

export const REDIRECT_BASE = serverUrl || fallbackServer;
