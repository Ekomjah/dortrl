import type { ContentfulStatusCode } from "hono/utils/http-status";

export class ConflictError extends Error {
  readonly status: ContentfulStatusCode;

  constructor(message: string, status: ContentfulStatusCode = 409) {
    super(message);
    this.status = status;
    this.name = "ConflictError";
  }
}