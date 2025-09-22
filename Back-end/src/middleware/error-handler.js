import { logger } from "../common/logger.js";

// Error handler middleware
export const errorHandler = (error, req, res, next) => {
  logger.error(`${req.method} ${req.url}:`, error.message);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
