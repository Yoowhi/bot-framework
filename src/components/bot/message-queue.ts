import TelegramBot, { ParseMode, SendMessageOptions, SendPhotoOptions } from "node-telegram-bot-api";
import { getBot } from "./bot";
import { ERROR } from "../logger";
import { read } from "../images";

export type MessageOptions = {
    photoPath?: string,
    markup?: ParseMode
}

type Message = {
    chatId: string,
    reply: Reply | string,
    options?: MessageOptions
}

export interface Button {
    text: string,
    callback_data: string
}

export interface URLButton {
    text: string,
    url: string
}

export interface Reply {
    text?: string;
    buttons?: ButtonRows
}

export type ButtonRow = Button[] | URLButton[];
export type ButtonRows = ButtonRow[];

const messageQueue: {msg: Message, resolve: (msg: TelegramBot.Message | undefined) => void}[] = [];

setInterval(async () => {
    let count = 0;
    while (messageQueue.length > 0 && count < 15) {
        let {msg, resolve} = messageQueue.shift()!;
        count++;
        const result = await send(msg.chatId, msg.reply, msg.options);
        resolve(result);
    }
}, 500);

export async function sendToChat(chatId: string, reply: Reply | string, options?: MessageOptions) {
    const promise = new Promise<TelegramBot.Message | undefined>((resolve, reject) => {
        messageQueue.push({
            msg: {
                chatId,
                reply,
                options
            },
            resolve
        });
    })
    return promise;
}

async function send(chatId: string, reply: Reply | string, options?: MessageOptions) {
    const bot = getBot();
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

function instanceOfReply(obj: any): obj is Reply {
    if (typeof obj !== "object") {
        return false;
    }
    return "text" in obj || "buttons" in obj;
}