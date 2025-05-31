import {LOG} from "./globalVars";

export const showAlert = (message) => {
    if (LOG) {
        alert(message)
    }
}
