import { CallbackQuery, Message } from "node-telegram-bot-api";
import { User } from "../models/db/user";
import { State } from "./state";
import { StartState } from "../models/states/start-state";
import { Reply } from "./state";
import { INFO } from "./logger";

export class Conversation {
    private user: User;
    public state: State;

    constructor(user: User, state?: typeof State) {
        this.user = user;
        this.state = state ? new state(user) : new StartState(user)
    }

    public async inputText(message: Message): Promise<Reply | undefined> {
        INFO("User sent message", {chatId: this.user.chatId, text: message.text});
        const result = await this.state.text(message);
        this.state = result.state;
        return result.reply;
    }

    public async inputButton(message: CallbackQuery): Promise<Reply | undefined> {
        INFO("User pushed button", {chatId: this.user.chatId, text: message.data});
        const result = await this.state.button(message);
        this.state = result.state;
        return result.reply;
    }
}