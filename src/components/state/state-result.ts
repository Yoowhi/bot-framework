import { Reply } from "./reply";
import { State } from "./state";


export interface StateResult {
    state: State;
    reply?: Reply;
}
