import logger from "../config/logger.js";

export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: "Manzil topilmadi" });
}

export function errorHandler(err, req, res, next) {

  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`);

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server xatosi",
  });
}
