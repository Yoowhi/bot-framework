import TelegramBot, { BotCommand, SendMessageOptions } from "node-telegram-bot-api";
import config from "../config.json";
import { Reply, State } from "./state";
import { DEBUG, ERROR, INFO, WARN } from "./logger";
import { Conversation } from "./conversation";
import { User, initUser } from "../models/db/user";

type CommandCallback = (user: User) => Reply | Promise<void> | void;
type Commands = { "/start": (typeof State) | CommandCallback, [key: string]: (typeof State) | CommandCallback };


let bot: TelegramBot;
let commandMap: Map<keyof Commands, (typeof State) | CommandCallback>
let conversations: Map<string, Conversation>;
let before: (user: User) => Promise<boolean> = async (user: User) => true;



export function initBot(commands: Commands, beforeCommand?: (user: User) => Promise<boolean>) {
    bot = new TelegramBot(config.bot.token, {polling: true});
    commandMap = new Map<keyof Commands, typeof State>();
    conversations = new Map<string, Conversation>();
    const commsList: BotCommand[] = [];
    for (const command in commands) {
        if (Object.prototype.hasOwnProperty.call(commands, command)) {
            const stateClass = commands[command];
            commsList.push({command, description: `command`});
            commandMap.set(command, stateClass);
        }
    }
    //bot.setMyCommands(commsList);
    listen();
}

export async function sendToChat(chatId: number, reply: Reply | string) {
    let options: SendMessageOptions = {parse_mode: "Markdown", disable_web_page_preview: true};
    let text: string;
    if (instanceOfReply(reply)) {
        text = reply.text ?? "";
        if (reply.buttons) {
            options.reply_markup = {
                inline_keyboard: reply.buttons
            }
        }
    } else {
        text = reply
    }
    try {
        return await bot.sendMessage(chatId, text, options);
    } catch (error) {
        ERROR("Message send error", {chatId, reply, error});
    }
}

async function listen() {
    INFO("Telegram callback initializing...");
    bot.on("text", async msg => {
        DEBUG("New message from " + msg.from?.id)
        const chatId = msg.chat.id;
        const userId = msg.from?.id;
        if (!userId) {
            WARN("userId is not available", {chatId: msg.chat.id, text: msg.text});
            return;
        }
        const user = await initUser(chatId, userId);
        if (!(await before(user))) {
            return;
        }
        if (msg.text && msg.text[0] === "/") {
            const [command, ...args] = msg.text.split(" ");
            const state = commandMap.get(command);
            if (state) {
                if (state.prototype instanceof State) {
                    const conversation = getConversation(user, true, state as typeof State);
                    return await conversation.state.enter();
                } else {
                    (state as CommandCallback)(user);
                    return;
                }
            }
        }
        const conversation = getConversation(user);
        await conversation.inputText(msg);
    });
    bot.on("callback_query", async msg => {
        const chatId = msg.message?.chat.id;
        const userId = msg.from?.id;
        if (!chatId || !userId) {
            WARN("BUTTON: userId or chatId is not available", {chatId, userId, button: msg.data});
            return;
        }
        const user = await initUser(chatId, userId);
        if (!(await before(user))) {
            return;
        }
        const conversation = getConversation(user);
        await conversation.inputButton(msg);
    })
    bot.on("polling_error", (error) => {
        ERROR("Polling error", error);
    });
    INFO("Telegram callback initialized");
    INFO("Service ready");
}

function getConversation(user: User, reset: boolean = false, stateClass?: typeof State) {
    const key = `${user.chatId},${user.userId}`;
    let conversation = conversations.get(key);
    if (!conversation || reset) {
        conversation = new Conversation(user);
        conversations.set(key, conversation);
    }
    return conversation;
}

function instanceOfReply(obj: any): obj is Reply {
    return "text" in obj || "buttons" in obj;
}