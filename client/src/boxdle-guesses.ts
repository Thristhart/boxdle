import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import "./combo-box";
import { GameOption, games, gamesAlphabetical } from "./games";

interface Guess extends GameOption {
    correct?: boolean;
}
@customElement("boxdle-guesses")
export class BoxdleGuesses extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }
        form {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            max-width: 24rem;
            width: 100%;
            flex-grow: 1;
        }
        #error {
        }
        .guessList {
            display: flex;
            flex-direction: row;
            height: 10rem;
            padding: 0;
            list-style-type: none;
            gap: 2vw;
        }
        .guessList img {
            object-fit: contain;
            height: 100%;
            width: 100%;
        }
        .guess {
            border: 2px solid var(--theme-gray);
            height: 16vw;
            width: 16vw;
            max-height: 10rem;
            max-width: 10rem;
            display: block;
            position: relative;
            box-sizing: border-box;
        }
        .guess.correct {
            background-color: var(--theme-correct);
            border-color: var(--theme-correct);
            border-width: 6px;
        }
        .guess.incorrect {
            background-color: var(--theme-incorrect);
            border-color: var(--theme-incorrect);
        }
        button {
            font-size: 2rem;
            font-family: inherit;
            border-style: solid;
            border-width: 20px;
            border-image: url("pixelBorderButton.png") 20 fill stretch;
            box-sizing: border-box;
            color: white;
            margin-top: 0.5rem;
        }
        button span {
            margin: -20px;
            display: block;
        }
    `;

    @state()
    guesses: Guess[] = [];
    @state()
    error: string | undefined;
    @property()
    correctId: string = "";
    @property({ type: Boolean })
    ended = false;

    comboBoxRef: Ref<HTMLInputElement> = createRef();

    connectedCallback() {
        super.connectedCallback();
    }

    guessInput() {
        return html`
            <form @submit=${this._submit}>
                ${this.error ? html`<span id="error">${this.error}</span>` : undefined}
                <combo-box name="game" ${ref(this.comboBoxRef)} @submit=${this._submit}>
                    ${gamesAlphabetical.map(game =>
                        this.guesses.some(guess => guess.id === game.id)
                            ? undefined
                            : html`<li data-id=${game.id}>${game.name}</li>`
                    )}
                </combo-box>
                <button type="submit"><span>Guess</span></button>
            </form>
        `;
    }

    guessList() {
        return html`
            <ul class="guessList">
                ${this.guesses.map(
                    guess =>
                        html`<li class="guess ${
                            guess.correct ? "correct" : "incorrect"
                        }"><img src=${
                            new URL(`./boxart/${guess.id}.png`, import.meta.url).href
                        } alt=${guess.name} title=${guess.name}></img></li>`
                )}
                ${Array.from(
                    { length: 5 - this.guesses.length },
                    () => html`<li class="guess"></li>`
                )}
            </ul>
        `;
    }

    shareButton() {
        return html` <button @click=${this._share}>Share</button> `;
    }

    private _share() {
        this.dispatchEvent(new CustomEvent("share"));
    }

    render() {
        if (this.ended) {
            return html`${this.guessList()} ${this.shareButton()}`;
        }
        return html`${this.guessInput()} ${this.guessList()}`;
    }

    private _submit(e: SubmitEvent) {
        const gameName = this.comboBoxRef.value?.value;
        const game = games.find(game => game.name === gameName);
        if (!game) {
            if (gameName !== "") {
                this.error = `Unknown game "${gameName}"`;
            }
            if ("preventDefault" in e) {
                e.preventDefault();
            }
            return;
        }

        if (game.id === this.correctId) {
            this.guesses = [...this.guesses, { ...game, correct: true }];
        } else {
            this.guesses = [...this.guesses, game];
        }
        if ("preventDefault" in e) {
            e.preventDefault();
        }
        this.dispatchEvent(new CustomEvent("guess"));
        setTimeout(() => {
            if (this.comboBoxRef.value) {
                this.comboBoxRef.value.value = "";
            }
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "boxdle-guesses": BoxdleGuesses;
    }
}

