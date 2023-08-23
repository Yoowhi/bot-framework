import TelegramBot, { SendMessageOptions } from "node-telegram-bot-api";
import config from "./config.json";
import { Reply } from "./components/state/reply";
import { DEBUG, ERROR, INFO } from "./components/logger";

const bot = new TelegramBot(config.bot.token, {polling: true});

export async function answer(chatId: number, reply: Reply | undefined) {
    if (!reply) {
        return;
    }
    let options: SendMessageOptions = {parse_mode: "Markdown"};
    if (reply.buttons) {
        options.reply_markup = {
            inline_keyboard: reply.buttons
        }
    }
    try {
        return bot.sendMessage(chatId, reply.text ?? "", options);
    } catch (error) {
        ERROR("Message send error", {chatId, reply, error});
    }
}

async function start() {
    INFO("Telegram callback initializing...");
    bot.on("text", async msg => {
        DEBUG("New message from " + msg.from?.id)
        
    });
    bot.on("callback_query", async msg => {
        if (!msg.message) {
            return;
        }
    })
    INFO("Telegram callback initialized");
    INFO("Service ready");
}

start();