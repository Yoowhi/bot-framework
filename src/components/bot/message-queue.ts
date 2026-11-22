import TelegramBot, { ParseMode, SendMessageOptions, SendPhotoOptions } from "node-telegram-bot-api";
import { getBot } from "./bot";
import { ERROR } from "../logger";
import { FileEntity } from "../../entity/file.entity";

export type MessageOptions = {
    photoPath?: string,
    markup?: ParseMode
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

const messageQueue: (() => void)[] = [];

setInterval(async () => {
    let count = 0;
    while (messageQueue.length > 0 && count < 15) {
        const action = messageQueue.shift()!;
        count++;
        action();
    }
}, 500);

export async function sendToChat(chatId: string, reply: Reply | string, options?: MessageOptions) {
    const promise = new Promise<TelegramBot.Message | undefined>((resolve, reject) => {
        messageQueue.push(() => {
            const result = send(chatId, reply, options);
            resolve(result);
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
            const file = await FileEntity.getByPath(options.photoPath);
            const res = await bot.sendPhoto(chatId, file, sendOptions);
            res.media_group_id
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