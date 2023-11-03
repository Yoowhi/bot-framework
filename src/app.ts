import { initBot, sendToChat } from "./components/bot";
import { initDB } from "./components/db";
import config from "./config.json";
import { StartState } from "./models/states/start-state";

initDB(config.db);

initBot({
    // This command uses async callback with Reply return type
    "/exampleCallback": async (user) => {
        await sendToChat(user.chatId, {
            text: "This is callback example",
            buttons: [
                [{text: "Example button", callback_data: "_"}]
            ]
        });
    },
    // This command uses State child class
    "/start": StartState, 
    // This command uses callback without returning Reply object, so the answer to user is not guaranteed
    "/exampleCallbackNoReturn": (user) => { 
        // Some background code without responding to user. You can directly call sendToChat() though
    }
});