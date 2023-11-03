import { CallbackQuery, Message } from "node-telegram-bot-api";
import { User } from "../models/db/user";
import { sendToChat } from "./bot";

interface Button {
    text: string,
    callback_data: string
}

export interface Reply {
    text?: string;
    buttons?: ButtonColumn[]
}

type ButtonColumn = Button[];



export class State {
    public user: User;

    constructor(user: User) {
        this.user = user;
    }


    public async enter(): Promise<State> {
        return this;
    }

    public async text(message: Message): Promise<State> {
        return this;
    }

    public async button(message: CallbackQuery): Promise<State> {
        return this;
    }

    public async noAction(): Promise<State> {
        return this;
    }

    public async message(data: Reply): Promise<Message | undefined> {
        return await sendToChat(this.user.chatId, data);
    }
}