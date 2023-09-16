import { CallbackQuery } from "node-telegram-bot-api";
import { State } from "../../components/state";
import { t } from "../../components/text";
import { INFO } from "../../components/logger";

export class StartState extends State {

    public async enter() {
        INFO("User entered StartState", this.user);
        return {
            state: this,
            reply: {
                text: t("example")
            }
        }
    }

    public async button(message: CallbackQuery) {
        switch (message.data) {
            default:
                return this.noAction();
        }
    }
}