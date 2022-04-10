import { games } from "./games";

// const guesses = document.querySelector("boxdle-guesses");
// const display = document.querySelector("boxdle-display");
// if (!guesses || !display) {
//     throw new Error("somehow missing required components");
// }

// guesses.addEventListener("incorrect", () => {
//     console.log("wrong");
//     display.guessNumber++;
// });
// guesses.addEventListener("correct", () => {
//     console.log("right");
// });

// const target = games[0];

// guesses.correctId = target.id;
// display.guid = target.id;

let index = 0;

const test = document.getElementById("test") as HTMLImageElement;
const name = document.getElementById("name") as HTMLHeadingElement;
const reverseCheckbox = document.getElementById("reverse") as HTMLInputElement;

reverseCheckbox.addEventListener("change", () => {
    drawGame();
});
function drawGame() {
    let effectiveIndex = reverseCheckbox.checked ? games.length - 1 - index : index;
    test.src = games[effectiveIndex].image;
    name.innerHTML = games[effectiveIndex].name;
}
test.addEventListener("click", () => {
    index++;
    drawGame();
});

drawGame();
