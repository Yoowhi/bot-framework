import { CallbackQuery, Message } from "node-telegram-bot-api";
import { User } from "../models/db/user";

interface StateResult {
    state: State;
    reply?: Reply;
}

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


    public async enter(): Promise<StateResult> {
        return {
            state: this,
            reply: undefined
        };
    }

    public async text(message: Message): Promise<StateResult> {
        return {
            state: this,
            reply: undefined
        };
    }

    public async button(message: CallbackQuery): Promise<StateResult> {
        return {
            state: this,
            reply: undefined
        };
    }

    public async noAction(): Promise<StateResult> {
        return {
            state: this,
            reply: undefined
        };
    }
}