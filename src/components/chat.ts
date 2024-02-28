import { CallbackQuery, Message } from "node-telegram-bot-api";
import { User } from "@prisma/client";
import { State } from "./state";
import { StartState } from "../models/states/start-state";
import { Reply } from "./state";
import { INFO } from "./logger";
import { initUser } from "../models/db/user";

export class Chat {
    private dialogs: {[key: string]: {user: User, state: State}}; // userId: state
    id: string;

    constructor(chatId: string) { //user: User, state?: typeof State
        this.dialogs = {};
        this.id = chatId;
    }

    public async inputText(message: Message): Promise<void> {
        INFO("User sent message", {chatId: this.id, userId: message.from?.id, text: message.text});

    }

    public async enterState(userId: string, state: typeof State, message: Message) {

    }

    public async inputButton(message: CallbackQuery): Promise<void> {
        INFO("User pushed button", {chatId: this.user.chatId, text: message.data});
        this.state = await this.state.button(message);
    }

    private async getDialog(userId: string, state?: typeof State) {
        let dialog = this.dialogs[userId];
        if (state) {
            const user = await initUser(userId);
            let dialog = {user, state: new state(user)};
            this.dialogs[userId] =  dialog;
        }
        if (!dialog) {

        }
        const user = await initUser(userId);
    }
}