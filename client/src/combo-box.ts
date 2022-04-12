import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { createRef, Ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import { GameOption } from "./games";

@customElement("combo-box")
export class ComboBox extends LitElement {
    static styles = css`
        :host {
            display: flex;
            position: relative;
            flex-direction: column;
            align-items: center;
        }
        div {
            width: 100%;
        }
        input {
            width: 100%;
            box-sizing: border-box;
            font: inherit;
            font-size: 1.5rem;
            background-color: var(--input-background-color, transparent);
            border-color: var(--theme-grey);
            border-radius: 10px;
            color: white;
        }
        ul {
            display: none;

            position: absolute;
            bottom: 100%;

            margin: 0;
            padding: 0;
            list-style: none;

            width: 100%;
            max-height: 20rem;
            overflow-y: auto;
            overflow-x: hidden;

            background-color: var(--dropdown-bg-color, white);

            border: 1px solid var(--dropdown-border-color, black);
            border-bottom: none;
            box-sizing: border-box;
            cursor: pointer;
        }
        ul li {
            width: 100%;
            padding-inline-start: 1rem;
            min-height: 2rem;
            display: inline-flex;
            flex-direction: row;
            align-items: center;
            font-size: 1.5rem;
        }
        ul li:hover {
            background: var(--dropdown-hover-color, #d1d1d1);
        }
        ul li[data-selected="true"] {
            background-color: var(--dropdown-selected-color, cornflowerblue);
        }
        input[aria-expanded="true"] ~ ul {
            display: block;
        }
        ::slotted(li) {
            display: none;
        }
    `;
    @state()
    options: GameOption[] = [];

    @state()
    filteredOptions: GameOption[] = [];

    @property()
    name: string | undefined;

    @state()
    showDropdown = false;

    @state()
    value = "";

    inputRef: Ref<HTMLInputElement> = createRef();

    @state()
    selectedDropdownIndex: number | undefined;

    handleSlotchange(e: Event) {
        const childNodes = (
            (e.target as HTMLSlotElement).assignedNodes({ flatten: true }) as HTMLElement[]
        ).filter(node => node.tagName === "LI");

        this.options = childNodes.map(node => {
            return { name: node.textContent ?? "", id: node.dataset["id"]! };
        });
    }

    optionMatchesInput(option: GameOption) {
        if (!this.value) {
            return true;
        }
        if (option.name.toLocaleLowerCase().includes(this.value.toLocaleLowerCase())) {
            return true;
        }
        return false;
    }

    updateFiltered() {
        this.filteredOptions = this.options.filter(opt => this.optionMatchesInput(opt));
        if (
            this.selectedDropdownIndex &&
            this.selectedDropdownIndex > this.filteredOptions.length
        ) {
            this.selectedDropdownIndex = this.filteredOptions.length - 1;
        }
    }
    selectedOption() {
        if (this.selectedDropdownIndex === undefined) {
            return undefined;
        }
        return this.filteredOptions[this.selectedDropdownIndex];
    }

    dropdown() {
        return html`
            <ul id="combobox-options" role="listbox">
                ${repeat(
                    this.filteredOptions,
                    ({ id }) => id,
                    ({ id, name }, index) =>
                        html`<li
                            role="option"
                            id=${id}
                            data-selected=${index === this.selectedDropdownIndex}
                            @click=${(event: MouseEvent) => this.clickDropdown(event, index)}>
                            ${name}
                        </li>`
                )}
            </ul>
        `;
    }
    clickDropdown(event: MouseEvent, index: number) {
        this.setSelectedIndex(index);
        this.value = this.selectedOption()?.name ?? "";
        this.showDropdown = false;
        this.selectedDropdownIndex = undefined;
    }
    render() {
        this.updateFiltered();
        return html`
            <div 
                @focusin=${this.onFocus}
                @focusout=${this.onBlur}>
                <input
                    type="text"
                    id="combobox"
                    .value=${live(this.value)}
                    aria-controls="combobox-options"
                    aria-autocomplete="list"
                    aria-expanded=${this.showDropdown}
                    aria-haspopup="listbox"
                    aria-activedescendant=${this.selectedOption()?.id}
                    name=${this.name}
                    @input=${this.onInput}
                    @keydown=${this.keyDown}
                    role="combobox"></input>
                ${this.dropdown()}
            </div>
            <slot @slotchange=${this.handleSlotchange}></slot>
        `;
    }
    onFocus() {
        this.showDropdown = true;
    }
    onBlur(event: FocusEvent) {
        if (!(event.relatedTarget && this.shadowRoot?.contains(event.relatedTarget as Node))) {
            setTimeout(() => {
                this.showDropdown = false;
            }, 500);
        }
    }
    onInput(e: InputEvent) {
        const newValue = (e.target as HTMLInputElement)?.value ?? "";
        if ((this.value === "" && newValue !== "") || (this.value !== "" && newValue === "")) {
            this.showDropdown = true;
        }
        this.value = newValue;
        this.updateFiltered();
    }
    setSelectedIndex(newIndex: number) {
        if (newIndex < 0) {
            newIndex = this.filteredOptions.length - 1;
        } else if (newIndex >= this.filteredOptions.length) {
            newIndex = 0;
        }

        this.selectedDropdownIndex = newIndex;

        const selectedId = this.selectedOption()?.id;
        if (selectedId) {
            this.shadowRoot
                ?.getElementById(selectedId)
                ?.scrollIntoView({ behavior: "auto", block: "nearest" });
        }
    }
    keyDown(event: KeyboardEvent) {
        if (event.ctrlKey || event.shiftKey) {
            return;
        }
        let handled = false;
        const selected = this.selectedOption();
        switch (event.key) {
            case "Enter":
                if (selected) {
                    this.value = selected.name;
                    this.showDropdown = false;
                    this.selectedDropdownIndex = undefined;
                    handled = true;
                } else {
                    this.dispatchEvent(
                        new SubmitEvent("submit", {
                            bubbles: true,
                            cancelable: true,
                            submitter: event.target as HTMLElement,
                            composed: true,
                        })
                    );
                }
                break;
            case "Tab":
                if (this.filteredOptions.length > 0 && this.value !== "") {
                    if (selected) {
                        this.value = selected.name;
                    } else {
                        this.value = this.filteredOptions[0].name;
                    }
                    this.showDropdown = false;
                    this.selectedDropdownIndex = undefined;
                    handled = true;
                }
                break;
            case "Esc":
            case "Escape":
                if (this.showDropdown) {
                    this.showDropdown = false;
                    handled = true;
                }
                break;

            case "Up":
            case "ArrowUp":
                if (this.filteredOptions.length > 0) {
                    this.showDropdown = true;
                    handled = true;
                    if (event.altKey) {
                        break;
                    }
                    if (this.selectedDropdownIndex !== undefined) {
                        this.setSelectedIndex(this.selectedDropdownIndex - 1);
                    } else {
                        this.setSelectedIndex(-1);
                    }
                }
                break;

            case "Down":
            case "ArrowDown":
                if (this.filteredOptions.length > 0) {
                    this.showDropdown = true;
                    handled = true;
                    if (event.altKey) {
                        break;
                    }
                    if (this.selectedDropdownIndex !== undefined) {
                        this.setSelectedIndex(this.selectedDropdownIndex + 1);
                    } else {
                        this.setSelectedIndex(this.filteredOptions.length);
                    }
                }
                break;
        }
        if (handled) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "combo-box": ComboBox;
    }
}
