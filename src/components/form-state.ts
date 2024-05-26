import { CallbackQuery, Message } from "node-telegram-bot-api";
import { ButtonRows, Reply, State } from "./state";
import { ERROR } from "./logger";
import { DialogID } from "./bot/bot";

export type Step<T> = {
    text: string,
    type: "input" | "select" | "both",
    buttons?: ButtonRows,
    field: keyof T,
    process?(value: string): any
}

export abstract class FormState<T> extends State {
    protected abstract steps: Step<T>[];
    protected abstract outro(form: T): Promise<State>;
    
    private form: Partial<T>;
    private currentStep: number;

    constructor(dialog: DialogID) {
        super(dialog);
        this.form = {};
        this.currentStep = 0;
    }

    protected async intro(): Promise<void> {
        return;
    }

    public async enter(): Promise<State> {
        await this.intro();
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
        const process = this.steps[this.currentStep].process;
        if (process) {
            try {
                this.form[field] = process(message.text);
            } catch (error) {
                if (typeof error === "string") {
                    await this.message({
                        text: error as string,
                        buttons: this.steps[this.currentStep].buttons
                    });
                } else {
                    ERROR("Error in form step", {user: this.dialog.userId, chat: this.dialog.chatId, field: field, value: message.text, error});
                }
                return this;
            }
        } else {
            this.form[field] = message.text as T[keyof T];
        }
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
        const process = this.steps[this.currentStep].process;
        if (process) {
            try {
                this.form[field] = process(message.data);
            } catch (error) {
                if (typeof error === "string") {
                    await this.message({
                        text: error as string,
                        buttons: this.steps[this.currentStep].buttons
                    });
                } else {
                    ERROR("Error in form step", {user: this.dialog.userId, chat: this.dialog.chatId, field: field, value: message.data, error});
                }
                return this;
            }
        } else {
            this.form[field] = message.data as T[keyof T];
        }
        return await this.continue();
    }

    private async continue(): Promise<State> {
        if (this.currentStep + 1 >= this.steps.length) {
            return await this.outro(this.form as T);
        }
        this.currentStep++;
        await this.message({
            text: this.steps[this.currentStep].text,
            buttons: this.steps[this.currentStep].buttons
        });
        return this;
    }
}