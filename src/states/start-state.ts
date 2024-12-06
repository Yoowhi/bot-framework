import { State } from "../components/state";
import { t } from "../components/text";
import { INFO } from "../components/logger";
import { CallbackQuery, Message } from "node-telegram-bot-api";

export class StartState extends State {

    public async enter() {
        INFO("User entered StartState", this.dialog.userId);
        await this.message({
            text: t("example")
        })
        return this;
    }

    public async text(message: Message): Promise<State> {
        return await this.enter();
    }

    public async button(message: CallbackQuery): Promise<State> {
        return await this.enter();
    }
}