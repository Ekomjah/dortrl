import { isAxiosError } from "axios";

export interface ApiError {
  status?: number;
  message: string;
}

const NETWORK_MESSAGE =
  "Couldn't reach the server. Check your connection and try again.";
const UNKNOWN_MESSAGE = "Something went wrong. Please try again.";

function readMessage(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;

  if ("errors" in data && Array.isArray((data as { errors: unknown }).errors)) {
    const errors = (data as { errors: unknown[] }).errors.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
    if (errors.length > 0) return errors.join(". ");
  }

  for (const key of ["message", "error"] as const) {
    if (key in data) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
  }

  return null;
}

export function getApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    return {
      status: error.response?.status,
      message:
        readMessage(error.response?.data) ??
        (error.code === "ERR_NETWORK" ? NETWORK_MESSAGE : error.message) ??
        UNKNOWN_MESSAGE,
    };
  }

  if (error instanceof Error && error.message) {
    return { message: error.message };
  }

  return { message: UNKNOWN_MESSAGE };
}
