import TelegramBot, { BotCommand, Message } from "node-telegram-bot-api";
import config from "../../config.json";
import { State } from "../state";
import { DEBUG, ERROR, INFO, WARN } from "../logger";
import { Chat } from "../chat";
import { User } from "@prisma/client";
import { UserEntity } from "../../entity/user.entity";
import { ChatEntity } from "../../entity/chat.entity";
import { FileEntity, FileType } from "../../entity/file.entity";

type Command = {stateClass: typeof State, description: string};
type Commands = { "/start": Command, [key: string]: Command };

export type DialogID= {
    userId: string,
    chatId: string
}

let bot: TelegramBot;
let commandMap: Map<keyof Commands, typeof State>
let chats: Map<string, Chat>;
let before: (chatId: string, userId: string) => Promise<typeof State | undefined> = async (chatId: string, userId: string) => undefined;

const mediaGroupHandler: Map<string, Message[]> = new Map();

export function getBot() {
    return bot;
}


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

/**
 * @deprecated
 */
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
        UserEntity.updateOnMessage(userId, msg.from?.username);
        ChatEntity.updateOnMessage(chatId);
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
        UserEntity.updateOnMessage(userId, msg.from.username);
        ChatEntity.updateOnMessage(chatId);
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
        process.exit(1);
    });
    bot.on('message', async msg => {
        if (msg.video || msg.photo || msg.document) {
            const file = new FileEntity();
            if (msg.photo) {
                file.fileId = msg.photo[0].file_id;
                file.type = FileType.PHOTO;
            } else if (msg.video) {
                file.fileId = msg.video.file_id;
                file.type = FileType.VIDEO;
            } else if (msg.document) {
                file.fileId = msg.document.file_id;
                file.type = FileType.DOCUMENT;
            }
            if (msg.media_group_id) {
                file.mediaGroupId = msg.media_group_id;
                let mediaGroupMessages = mediaGroupHandler.get(file.mediaGroupId);
                if (!mediaGroupMessages) {
                    mediaGroupMessages = [];
                    mediaGroupHandler.set(file.mediaGroupId, mediaGroupMessages);
                    setTimeout(async () => {
                        const chatId = msg.chat.id.toString();
                        const userId = msg.from?.id.toString();
                        if (!userId) {
                            WARN("userId is not available", {chatId: msg.chat.id, text: msg.text});
                            return;
                        }
                        UserEntity.updateOnMessage(userId, msg.from?.username);
                        ChatEntity.updateOnMessage(chatId);
                        const chat = getChat(chatId);
                        const fallbackState = await before(chatId, userId);
                        if (fallbackState) {
                            await chat.enter(userId, fallbackState);
                            return;
                        }
                        await chat.inputText(userId, msg);
                    }, 1000);
                }
                mediaGroupMessages.push(msg);
            }
            await file.save();
        }
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