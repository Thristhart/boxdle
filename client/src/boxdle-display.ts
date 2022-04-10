import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

function getBoxartImageUrl(guid: string, step: number) {
    return new URL(`./boxart/steps/${guid}-${step}.png`, import.meta.url).href;
}

@customElement("boxdle-display")
export class BoxdleDisplay extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: relative;
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
    `;

    @property()
    guid = "";

    @property({ type: Number })
    guessNumber = 0;

    render() {
        return html`
            <img src=${getBoxartImageUrl(this.guid, this.guessNumber)}></img>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "boxdle-display": BoxdleDisplay;
    }
}

