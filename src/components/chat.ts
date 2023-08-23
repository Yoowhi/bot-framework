import { CallbackQuery, Message } from "node-telegram-bot-api";
import { User } from "../models/db/user";
import { State } from "./state/state";
import { StartState } from "../models/states/start-state";
import { Reply } from "./state/reply";
import { INFO } from "./logger";

export class Chat {
    private user: User;
    private chatId: number;
    public state: State;

    constructor(user: User, chatId: number, state?: State) {
        this.chatId = chatId;
        this.user = user;
        if (!state) {
            state = new StartState(user);
        }
        this.state = state;
    }

    public async inputText(message: Message): Promise<Reply | undefined> {
        INFO("User sent message", {chatId: this.chatId, text: message.text});
        const result = await this.state.text(message);
        this.state = result.state;
        return result.reply;
    }

    public async inputButton(message: CallbackQuery): Promise<Reply | undefined> {
        INFO("User pushed button", {chatId: this.chatId, text: message.data});
        const result = await this.state.button(message);
        this.state = result.state;
        return result.reply;
    }
}