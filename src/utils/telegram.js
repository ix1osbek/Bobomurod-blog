import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN2;  // BotFather tokeni
const channelId = process.env.TELEGRAM_CHANNEL_ID;     // Kanal username yoki -100XXXXXXXXXX

export const bot = new TelegramBot(token);
