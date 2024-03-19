import { initBot, sendToChat } from "./components/bot";
import { StartState } from "./models/states/start-state";

initBot({
    // This command uses async callback with Reply return type
    "/exampleCallback": async (chatId, userId) => {
        await sendToChat(chatId, {
            text: "This is callback example",
            buttons: [
                [{text: "Example button", callback_data: "_"}]
            ]
        });
    },
    // This command uses State child class
    "/start": StartState, 
    // This command uses callback without returning Reply object, so the answer to user is not guaranteed
    "/exampleCallbackNoReturn": (chatId, userId) => { 
        // Some background code without responding to user. You can directly call sendToChat() though
    }
});