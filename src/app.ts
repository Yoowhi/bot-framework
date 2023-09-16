import { initBot, sendToChat } from "./components/bot";
import { initDB } from "./components/db";
import config from "./config.json";
import { StartState } from "./models/states/start-state";

initDB(config.db);

initBot({
    "/start": (user) => {
        return {
            text: "Привет пошел нахуй",
            buttons: [
                [{text: "Пойти нахуй", callback_data: "hui"}]
            ]
        }
    },
    "/exampleStateClass": StartState,
    "/exampleNoReturn": (user) => {
        return undefined;
    }
});