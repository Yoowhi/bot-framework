import { initBot } from "./components/bot/bot";
import { StartState } from "./models/states/start-state";

initBot({
    "/start": {
        stateClass: StartState,
        description: "About"
    },
});