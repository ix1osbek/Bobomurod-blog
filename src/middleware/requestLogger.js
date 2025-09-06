import morgan from "morgan";
import logger from "../config/logger.js";

const stream = {
  write: (msg) => logger.info(msg.trim()),
};

const skip = () => process.env.NODE_ENV === "test";

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);
