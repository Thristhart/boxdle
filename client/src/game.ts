import "@ui5/webcomponents/dist/Toast";
import isMobile from "is-mobile";
import { games } from "./games";

const guessesElement = document.querySelector("boxdle-guesses");
const display = document.querySelector("boxdle-display");
if (!guessesElement || !display) {
    throw new Error("somehow missing required components");
}

guessesElement.addEventListener("guess", () => {
    display.guessNumber++;
    const lastGuess = guessesElement.guesses[guessesElement.guesses.length - 1];
    if (lastGuess.correct || display.guessNumber >= 5) {
        display.ended = true;
        guessesElement!.ended = true;
    }
    localStorage.setItem(
        "boxdle-state",
        JSON.stringify({ guesses: guessesElement.guesses, correctIndex: guessIndex })
    );
});
function getGuessCount() {
    const lastGuess = guessesElement!.guesses[guessesElement!.guesses.length - 1];
    if (!lastGuess.correct) {
        return "X/5";
    }
    return `${guessesElement!.guesses.length}/5`;
}
function share(text: string) {
    // i hate this isMobile check but the windows share implementation is so bad...
    if (isMobile({ tablet: true }) && navigator.canShare({ text })) {
        navigator.share({ text });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            // @ts-ignore
            document.getElementById("copySuccessToast").show();
        });
    }
}
guessesElement.addEventListener("share", () => {
    let guessBoxes = "";
    for (let i = 0; i < 5; i++) {
        const guess = guessesElement.guesses[i];
        if (!guess) {
            guessBoxes += "⬜️";
        } else if (guess.correct) {
            guessBoxes += "🟩";
        } else {
            guessBoxes += "⬛";
        }
    }
    share(`boxdle #${dayNumber} ${getGuessCount()}\n${guessBoxes}\n${location.href}`);
});

const dayInMS = 1000 * 60 * 60 * 24;
const startDate = new Date(2022, 3, 9, 0, 0, 0, 0);
const currentDate = new Date();
const difference = currentDate.setHours(0, 0, 0, 0) - startDate.setHours(0, 0, 0, 0);
const dayNumber = Math.round(difference / dayInMS);
let guessIndex = dayNumber % games.length;

function loadStateFromLocalStorage() {
    if (location.search === "?clear") {
        localStorage.clear();
    }
    const stateString = localStorage.getItem("boxdle-state");
    if (!stateString) {
        return;
    }
    let savedState;
    try {
        savedState = JSON.parse(stateString);
    } catch (e) {
        return;
    }
    if ("correctIndex" in savedState) {
        if (savedState.correctIndex !== guessIndex) {
            // state isn't relevant anymore bc the day has continued
            return;
        }
    }
    guessesElement!.guesses = savedState.guesses;
    display!.guessNumber = savedState.guesses.length;
    const last = savedState.guesses[savedState.guesses.length - 1];
    if (last.correct || savedState.guesses.length >= 5) {
        display!.ended = true;
        guessesElement!.ended = true;
    }
}

loadStateFromLocalStorage();

let canShare = true;

if (location.search === "?random") {
    guessIndex = Math.floor(Math.random() * games.length);
    canShare = false;
}
const target = games[guessIndex];

guessesElement.correctId = target.id;
display.guid = target.id;
guessesElement.canShare = canShare;
