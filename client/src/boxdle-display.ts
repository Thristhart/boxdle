import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { games } from "./games";

function getBoxartImageUrl(guid: string, step: number) {
    return new URL(`./boxart/steps/${guid}-${step}.png`, import.meta.url).href;
}
function getCompleteBoxartImageUrl(guid: string) {
    return new URL(`./boxart/${guid}.png`, import.meta.url).href;
}

@customElement("boxdle-display")
export class BoxdleDisplay extends LitElement {
    static styles = css`
        :host {
            display: flex;
            position: relative;
            flex-direction: column;
            align-items: center;
        }
        img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            image-rendering: crisp-edges;
            image-rendering: pixelated;
        }
        #container {
            position: relative;
            flex-grow: 1;
            width: 100%;
        }
    `;

    @property()
    guid = "";

    @property({ type: Number })
    guessNumber = 0;

    @property({ type: Boolean })
    ended = false;

    render() {
        if (!this.guid) {
            return;
        }
        if (this.ended) {
            const name = games.find(({ id }) => id === this.guid)?.name;
            return html`
                <div id="container">
                    <img src=${getCompleteBoxartImageUrl(this.guid)} aria-label=${name}></img>
                </div>
                <h2>${name}</h2>
            `;
        }
        return html`
            <img src=${getBoxartImageUrl(
                this.guid,
                this.guessNumber
            )} aria-label="Pixelated box art. Step ${this.guessNumber} out of 5"></img>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "boxdle-display": BoxdleDisplay;
    }
}

