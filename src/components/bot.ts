import TelegramBot, { BotCommand, SendMessageOptions, SendPhotoOptions, ParseMode } from "node-telegram-bot-api";
import config from "../config.json";
import { ButtonRows, Reply, State } from "./state";
import { DEBUG, ERROR, INFO, WARN } from "./logger";
import { Chat } from "./chat";
import { User } from "@prisma/client";
import { read } from "./images";

type Command = {stateClass: typeof State, description: string}
type Commands = { "/start": Command, [key: string]: Command };
export type MessageOptions = {
    photoPath?: string,
    markup?: ParseMode
}


let bot: TelegramBot;
let commandMap: Map<keyof Commands, typeof State>
let chats: Map<string, Chat>;
let before: (chatId: string, userId: string) => Promise<typeof State | undefined> = async (chatId: string, userId: string) => undefined;



export function initBot(commands: Commands, beforeCommand?: (user: User) => Promise<boolean>) {
    bot = new TelegramBot(config.bot.token, {polling: true});
    commandMap = new Map<keyof Commands, typeof State>();
    chats = new Map<string, Chat>();
    const commsList: BotCommand[] = [];
    for (const command in commands) {
        if (Object.prototype.hasOwnProperty.call(commands, command)) {
            const commandInfo = commands[command];
            commsList.push({command, description: commandInfo.description});
            commandMap.set(command, commandInfo.stateClass);
        }
    }
    bot.setMyCommands(commsList);
    listen();
}

export async function sendToChat(chatId: string, reply: Reply | string, options?: MessageOptions) {
    let text: string;
    let buttons: ButtonRows | undefined;
    if (instanceOfReply(reply)) {
        text = reply.text ?? "";
        if (reply.buttons) {
            buttons = reply.buttons;
        }
    } else {
        text = reply
    }
    try {
        if (options?.photoPath) {
            const sendOptions: SendPhotoOptions = {
                caption: text,
                parse_mode: options.markup ?? "HTML",
            }
            if (buttons) {
                sendOptions.reply_markup = {
                    inline_keyboard: buttons
                }
            }
            const file = await read(options.photoPath);
            return await bot.sendPhoto(chatId, file, sendOptions);
        } else { 
            const sendOptions: SendMessageOptions = {
                parse_mode: options?.markup ?? "HTML", 
                disable_web_page_preview: true
            };
            if (buttons) {
                sendOptions.reply_markup = {
                    inline_keyboard: buttons
                }
            }
            return await bot.sendMessage(chatId, text, sendOptions);
        }
    } catch (error) {
        ERROR("Message send error", {chatId, reply, error});
    }
}

export async function answerCallbackQuery(callbackQueryId: string) {
    try {
        return await bot.answerCallbackQuery({callback_query_id: callbackQueryId});
    } catch (error) {
        ERROR("Callback query error", {error});
    }
}

async function listen() {
    INFO("Telegram callback initializing...");
    bot.on("text", async msg => {
        DEBUG("New message from " + msg.from?.id)
        const chatId = msg.chat.id.toString();
        const userId = msg.from?.id.toString();
        if (!userId) {
            WARN("userId is not available", {chatId: msg.chat.id, text: msg.text});
            return;
        }
        const chat = getChat(chatId);
        const fallbackState = await before(chatId, userId);
        if (fallbackState) {
            await chat.enter(userId, fallbackState);
            return;
        }
        if (msg.text && msg.text[0] === "/") {
            const [command, ...args] = msg.text.split(" ");
            const state = commandMap.get(command);
            if (state) {
                await chat.enter(userId, state, args.length > 0 ? args : undefined);
                return;
            }
        }
        await chat.inputText(userId, msg);
    });
    bot.on("callback_query", async msg => {
        const chatId = msg.message?.chat.id.toString();
        const userId = msg.from?.id.toString();
        if (!chatId || !userId) {
            WARN("BUTTON: userId or chatId is not available", {chatId, userId, button: msg.data});
            return;
        }
        const chat = getChat(chatId);
        const fallbackState = await before(chatId, userId);
        if (fallbackState) {
            await chat.enter(userId, fallbackState);
            return;
        }
        await chat.inputButton(userId, msg);
    })
    bot.on("polling_error", (error) => {
        ERROR("Polling error", error);
    });
    INFO("Telegram callback initialized");
    INFO("Service ready");
}

function getChat(chatId: string) {
    let chat = chats.get(chatId);
    if (!chat) {
        chat = new Chat(chatId);
        chats.set(chatId, chat);
    }
    return chat;
}

function instanceOfReply(obj: any): obj is Reply {
    if (typeof obj !== "object") {
        return false;
    }
    return "text" in obj || "buttons" in obj;
}