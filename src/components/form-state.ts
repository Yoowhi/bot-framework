import { CallbackQuery, Message } from "node-telegram-bot-api";
import { ButtonRows, Reply, State } from "./state";

type Step<T> = {
    text: string,
    type: "input" | "select" | "both",
    buttons?: ButtonRows
    field: keyof T
}

type Stringed<T> = {[K in keyof T]: string};

export abstract class FormState<T> extends State {
    protected abstract steps: Step<T>[];
    protected abstract summarize(form: Stringed<T>): Promise<{reply: Reply, state: typeof State}>;
    
    private form: Partial<Stringed<T>>;
    private currentStep: number;

    constructor(userId: string, chatId: string) {
        super(userId, chatId);
        this.form = {};
        this.currentStep = 0;
    }

    public async enter(): Promise<State> {
        await this.message({
            text: this.steps[this.currentStep].text,
            buttons: this.steps[this.currentStep].buttons
        });
        return this;
    }

    public async text(message: Message): Promise<State> {
        if (this.steps[this.currentStep].type === "select") {
            return this;
        }
        if (!message.text) {
            return this;
        }
        const field = this.steps[this.currentStep].field;
        this.form[field] = message.text;
        return await this.continue();
    }

    public async button(message: CallbackQuery): Promise<State> {
        if (this.steps[this.currentStep].type === "input") {
            return this;
        }
        if (!message.data) {
            return this;
        }
        const field = this.steps[this.currentStep].field;
        this.form[field] = message.data;
        return await this.continue();
    }

    private async continue(): Promise<State> {
        if (this.currentStep + 1 >= this.steps.length) {
            const {reply, state} = await this.summarize(this.form as Stringed<T>);
            await this.message(reply);
            return new state(this.userId, this.chatId);
        }
        this.currentStep++;
        await this.message({
            text: this.steps[this.currentStep].text,
            buttons: this.steps[this.currentStep].buttons
        });
        return this;
    }
}