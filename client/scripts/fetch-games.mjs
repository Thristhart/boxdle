import { writeFile } from "fs/promises";
import fetch from "node-fetch";

const requestQueue = [];
const politeTimeout = 18000;
let currentTimeout;

const apiKey = process.env.GB_API_KEY;
if (!apiKey) {
    throw new Error("set GB_API_KEY to giantbomb API key");
}

const results = [];

async function makeRequestFromQueue() {
    console.log(`making request from queue. remaining: ${requestQueue.length}`);
    const url = requestQueue.shift();
    if (!url) {
        return;
    }
    if (!currentTimeout) {
        currentTimeout = setTimeout(() => {
            currentTimeout = undefined;
            makeRequestFromQueue();
        }, politeTimeout);
        console.log(`fetching ${url}`);
        const response = await fetch(url);
        const searchResults = await response.json();
        const game = searchResults.results[0];
        if (!game) {
            console.error(`no result for ${url}`);
            return;
        }
        results.push({ name: game.name, id: game.guid, image: game.image.original_url });
        await writeFile("./gbData.json", JSON.stringify(results));
    }
}

async function getGameFromGB(name) {
    requestQueue.push(
        `https://www.giantbomb.com/api/search/?api_key=${apiKey}&query=${name}&format=json&field_list=guid,image,name&limit=1&resources=game`
    );
}

async function getGamesFromList() {
    getGameFromGB("MechWarrior 2: 31st Century Combat");
    makeRequestFromQueue();
}

getGamesFromList();
