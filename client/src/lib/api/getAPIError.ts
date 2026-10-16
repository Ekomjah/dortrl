import { isAxiosError } from "axios";

interface ErrorResponse {
  error: string;
  detail: string;
}

function isErrorResponse(data: unknown): data is ErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    "detail" in data &&
    typeof (data as ErrorResponse).error === "string" &&
    typeof (data as ErrorResponse).detail === "string"
  );
}

export function getApiError(error: unknown): ErrorResponse | null {
  if (isErrorResponse(error)) {
    return error;
  }

  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (isErrorResponse(data)) {
      return data;
    }
  }

  if (isAxiosError(error)) {
    return {
      error: "NetworkError",
      detail:
        error.message ||
        "The API request failed. Check the browser console or backend logs.",
    };
  }

  return null;
}
