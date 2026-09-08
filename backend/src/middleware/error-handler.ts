import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { HttpError } from "../lib/http-error.js";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { message: "Route not found." } });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  void next;
  if (error instanceof ZodError) {
    return res.status(400).json({ error: { message: "Invalid request data.", details: error.flatten() } });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: { message: error.message } });
  }

  console.error(error);
  return res.status(500).json({
    error: {
      message: "An unexpected server error occurred.",
      ...(env.NODE_ENV === "development" && error instanceof Error ? { detail: error.message } : {}),
    },
  });
};
