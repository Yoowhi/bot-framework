import { CallbackQuery, Message } from "node-telegram-bot-api";
import { DialogID, MessageOptions, sendToChat } from "./bot";
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
    public dialog: DialogID;
    protected get user() : Promise<User> {
        return (async () => {
            let user = await prisma.user.findFirst({
                where: {
                    userId: this.dialog.userId
                }
            });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        userId: this.dialog.userId,
                    }
                });
            }
            return user;
        })();
    }
    

    constructor(dialog: DialogID) {
        this.dialog = dialog;
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

    public async message(data: Reply | string, options?: MessageOptions): Promise<Message | undefined> {
        return await sendToChat(this.dialog.chatId, data, options);
    }
}