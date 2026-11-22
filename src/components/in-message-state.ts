import { DialogID } from "./bot/bot";
import { State } from "./state";


export class InMessageState<T> extends State {
    data: T;
    messageId: string;

    constructor(dialog: DialogID, messageId: string, data: T) {
        super(dialog);
        this.data = data;
        this.messageId = messageId;
    }

    async update() {
        
    }
}