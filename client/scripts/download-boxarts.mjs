import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { games } from "../src/games.mjs";

const total = games.length;
let finished = 0;
Promise.all(
    games.map(async game => {
        const response = await fetch(game.image);
        await writeFile(`./src/boxart/${game.id}.png`, response.body);
        finished++;
        console.log(`${finished}/${total}`);
    })
);
