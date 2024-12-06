import "reflect-metadata";
import { initBot } from "./components/bot/bot";
import { StartState } from "./states/start-state";
import { initDB } from "./components/db";

(async () => {
    await initDB();
    initBot({
        "/start": {
            stateClass: StartState,
            description: "About"
        },
    });
})();
