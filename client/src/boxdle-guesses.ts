import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/ComboBox.js";
import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
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
        ui5-combobox {
            width: 100%;
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
                <ui5-combobox
                    name="game"
                    ${ref(this.comboBoxRef)}
                    filter="Contains"
                    @keyup=${this._comboboxKeyup}>
                    ${gamesAlphabetical.map(game =>
                        this.guesses.some(guess => guess.id === game.id)
                            ? undefined
                            : html`<ui5-cb-item text=${game.name}></ui5-cb-item>`
                    )}
                </ui5-combobox>
                <!-- todo: switch to "submits" when ui5 publishes an update -->
                <ui5-button @click=${this._fakeSubmit}>Guess</ui5-button>
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
        return html` <ui5-button @click=${this._share}>Share</ui5-button> `;
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

    private _fakeSubmit() {
        const submitEvent = {
            ...new SubmitEvent("submit"),
            target: this.comboBoxRef.value?.parentElement as EventTarget,
        };
        this._submit(submitEvent);
    }

    private _comboboxKeyup(e: KeyboardEvent) {
        if (e.key === "Enter") {
            this._fakeSubmit();
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "boxdle-guesses": BoxdleGuesses;
    }
}
