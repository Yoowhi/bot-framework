import { CallbackQuery, Message } from "node-telegram-bot-api";
import { MessageOptions, Reply, sendToChat } from "./bot/message-queue";
import { WARN } from "./logger";
import { DialogID } from "./bot/bot";
import { UserEntity } from "../entity/user.entity";
import { ChatEntity } from "../entity/chat.entity";


export class State {
    public dialog: DialogID;
    protected get user() : Promise<UserEntity> {
        return (async () => {
            let user = await UserEntity.findOne({where: {
                id: this.dialog.userId
            }})
            if (!user) {
                throw new Error("User entity not found!");
            }
            return user;
        })();
    }

    protected get chat() : Promise<ChatEntity> {
        return (async () => {
            let chat = await ChatEntity.findOne({where: {
                id: this.dialog.chatId
            }})
            if (!chat) {
                throw new Error("Chat entity not found!");
            }
            return chat;
        })();
    }

    protected next<T extends State>(stateClass: new (dialog: any, ...args: any[]) => T, ...args: any[]): T {
        return new stateClass(this.dialog, ...args);
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