import { State } from "../../components/state";
import { t } from "../../components/text";
import { INFO } from "../../components/logger";

export class StartState extends State {

    public async enter() {
        INFO("User entered StartState", this.dialog.userId);
        await this.message({
            text: t("example")
        })
        return this;
    }
}