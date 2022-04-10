import { games } from "./games";

const guesses = document.querySelector("boxdle-guesses");
const display = document.querySelector("boxdle-display");
if (!guesses || !display) {
    throw new Error("somehow missing required components");
}

guesses.addEventListener("incorrect", () => {
    console.log("wrong");
    display.guessNumber++;
});
guesses.addEventListener("correct", () => {
    console.log("right");
});

const target = games[0];

guesses.correctId = target.id;
display.guid = target.id;
