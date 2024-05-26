import { CallbackQuery, Message } from "node-telegram-bot-api";
import { State } from "./state";
import { StartState } from "../models/states/start-state";
import { INFO } from "./logger";
import { answerCallbackQuery } from "./bot/bot";
import { initUser } from "./prisma";

export class Chat {
    private dialogs: {[key: string]: State}; // userId: state
    private chatId: string;

    constructor(chatId: string) {
        this.dialogs = {};
        this.chatId = chatId;
    }

    public async inputText(userId: string, message: Message): Promise<void> {
        INFO("User sent message", {chatId: this.chatId, userId: message.from?.id, text: message.text});
        const dialog = this.getDialog(userId);
        this.dialogs[userId] = await dialog.text(message);
    }

    public async enter(userId: string, state: typeof State, args?: string[]) {
        const dialog = this.getDialog(userId, state);
        this.dialogs[userId] = await dialog.enter(args);
    }

    public async inputButton(userId: string, message: CallbackQuery): Promise<void> {
        INFO("User pushed button", {chatId: this.chatId, text: message.data});
        const dialog = this.getDialog(userId);
        this.dialogs[userId] = await dialog.button(message);
        await answerCallbackQuery(message.id);
    }

    private getDialog(userId: string, state?: typeof State) {
        let dialog = this.dialogs[userId];
        if (!dialog) {
            initUser(userId);
        }
        if (!dialog || state) {
            const dialogId = {
                userId: userId,
                chatId: this.chatId
            }
            dialog = state? new state(dialogId) : new StartState(dialogId);
            this.dialogs[userId] = dialog;
        }
        return dialog;
    }
}