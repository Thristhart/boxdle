import {
    Combobox,
    fluentButton,
    fluentCombobox,
    fluentOption,
    provideFluentDesignSystem,
} from "@fluentui/web-components";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";
import { GameOption, games } from "./games";

provideFluentDesignSystem().register(fluentCombobox(), fluentOption(), fluentButton());

@customElement("boxdle-guesses")
export class BoxdleGuesses extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            height: 10rem;
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
        }
    `;

    @state()
    guesses: GameOption[] = [];
    @state()
    error: string | undefined;
    @property()
    correctId: string = "";

    comboBoxRef: Ref<Combobox> = createRef();

    render() {
        return html`
            <form @submit=${this._submit}>
                ${this.error ? html`<span id="error">${this.error}</span>` : undefined}
                <fluent-combobox
                    autocomplete="both"
                    name="game"
                    ${ref(this.comboBoxRef)}
                    @keyup=${this._comboboxKeyup}>
                    ${games
                        .filter(game => !this.guesses.some(guess => guess.id === game.id))
                        .map(game => html`<fluent-option>${game.name}</fluent-option>`)}
                </fluent-combobox>
                <fluent-button appearance="primary" type="submit">Guess</fluent-button>
            </form>
            <ul class="guessList">
                ${this.guesses.map(
                    guess =>
                        html`<li class="guess"><img src=${
                            new URL(`./boxart/steps/${guess.id}-${4}.png`, import.meta.url).href
                        }></img>${guess.name}</li>`
                )}
            </ul>
        `;
    }

    private _submit(e: SubmitEvent) {
        const formData = new FormData(e.target as HTMLFormElement);
        const gameName = formData.get("game");
        const game = games.find(game => game.name === gameName);
        if (!game) {
            if (gameName !== "") {
                this.error = `Unknown game "${gameName}"`;
            }
            e.preventDefault();
            return;
        }

        this.guesses = [...this.guesses, game];
        if (game.id === this.correctId) {
            this.dispatchEvent(new CustomEvent("correct"));
        } else {
            this.dispatchEvent(new CustomEvent("incorrect"));
        }
        if ("preventDefault" in e) {
            e.preventDefault();
        }
        setTimeout(() => {
            if (this.comboBoxRef.value) {
                this.comboBoxRef.value.value = "";
            }
        });
    }

    private _comboboxKeyup(e: KeyboardEvent) {
        if (e.key === "Enter") {
            const submitEvent = {
                ...new SubmitEvent("submit"),
                target: this.comboBoxRef.value?.parentElement as EventTarget,
            };
            this._submit(submitEvent);
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "boxdle-guesses": BoxdleGuesses;
    }
}
