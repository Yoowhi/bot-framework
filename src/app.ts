import { initBot, sendToChat } from "./components/bot";
import { StartState } from "./models/states/start-state";

initBot({
    "/start": {
        stateClass: StartState,
        description: "About"
    },
});