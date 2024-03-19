import { CallbackQuery, Message } from "node-telegram-bot-api";
import { sendToChat } from "./bot";
import prisma from "./prisma";
import { User } from "@prisma/client";

export interface Button {
    text: string,
    callback_data: string
}

export interface Reply {
    text?: string;
    buttons?: ButtonRows
}

export type ButtonRow = Button[];
export type ButtonRows = ButtonRow[];



export class State {
    public userId: string;
    public chatId: string;

    constructor(userId: string, chatId: string) {
        this.userId = userId;
        this.chatId = chatId;
    }


    public async enter(args?: string[]): Promise<State> {
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

    public async message(data: Reply | string): Promise<Message | undefined> {
        return await sendToChat(this.chatId, data);
    }

    protected async getUser(): Promise<User> {
        let user = await prisma.user.findFirst({
            where: {
                userId: this.userId
            }
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    userId: this.userId,
                }
            });
        }
        return user;
    }
}