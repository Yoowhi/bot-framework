import { CallbackQuery, Message } from "node-telegram-bot-api";
import { StateResult } from "./state-result";
import { User } from "../../models/db/user";

export abstract class State {
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