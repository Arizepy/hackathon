import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new Target().constructor);
  }
}

// Dummy target class for prototype manipulation
class Target {}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    console.warn(`[AppError] ${err.statusCode} - ${err.code}: ${err.message}`);
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle Zod validation errors
  if (err.name === "ZodError" || (err.errors && Array.isArray(err.errors))) {
    const message = err.errors
      ? err.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ")
      : err.message;
    console.warn(`[ValidationError] 400 - VALIDATION_ERROR: ${message}`);
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message,
      },
    });
  }

  // Catch all other unexpected server errors
  console.error("[InternalError]", err);
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
    },
  });
};
