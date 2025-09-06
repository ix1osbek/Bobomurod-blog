import axios from "axios";

const LOGTAIL_URL = "https://s1508423.eu-nbg-2.betterstackdata.com"; // Sizning Source host
// console.log(process.env.LOGTAIL_SOURCE_TOKEN);

const LOGTAIL_TOKEN = process.env.LOGTAIL_SOURCE_TOKEN;

const sendLog = async (level, message, meta = {}) => {
    try {
        await axios.post(
            LOGTAIL_URL,
            {
                dt: new Date().toISOString(),
                level,
                message,
                ...meta,
            },
            {
                headers: {
                    Authorization: `Bearer ${LOGTAIL_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (err) {
        console.error(`Logtail ${level} log error:`, err.message);
    }
};

const logger = {
    info: (message, meta) => sendLog("info", message, meta),
    error: (message, meta) => sendLog("error", message, meta),
    warn: (message, meta) => sendLog("warn", message, meta),
    debug: (message, meta) => sendLog("debug", message, meta),
};

export default logger;
