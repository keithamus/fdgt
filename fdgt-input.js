import {css, html} from './helpers.js'
import {FidgetElement} from './fdgt-element.js'

const styles = css`
  :host {
    margin: 3px;
  }

  label {
    display: flex;
    align-items: center;
  }

  input {
    display: flex;
    width: 100%;
    align-items: center;
    border-radius: var(--fdgt-button-radius, var(--fdgt-radius-1));
    color: var(--fdgt-button-fg, var(--fdgt-fg-1));
    min-height: 30px;
    width: 100px;
    flex: 1;
    background: var(--fdgt-button-bg, var(--fdgt-bg-2));
    border: 1px solid var(--fdgt-button-br, var(--fdgt-br-1));
    box-shadow: 0 1px 1px var(--fdgt-button-sh, var(--fdgt-sh-1));
  }

  [name=label] {
    display: block;
    margin-right: 5px
  }

  [name=label]:empty {
    display: none;
  }

  :host([variant=text]) button {
    background: none;
    border: 1px solid transparent;
    box-shadow: none;
  }

  input:hover {
    background: var(--fdgt-button-hover-br, var(--fdgt-bg-3));
  }

  :host([variant=text]) input:hover {
    background: var(--fdgt-button-text-hover-br, var(--fdgt-bg-4));
  }

  input:focus, input:active {
    background: var(--fdgt-button-active-br, var(--fdgt-bg-1));
    box-shadow: 0 0 3px var(--fdgt-button-active-sh, var(--fdgt-sh-1)) inset;
    outline: var(--fdgt-focus-ring);
  }
`

const template = html`
  <label>
    <slot name="label"></slot>
    <fdgt-icon part="lead-icon"></fdgt-icon>
    <input part="input" type="text">
    <fdgt-icon part="trail-icon"></fdgt-icon>
  </label>
`

customElements.define('fdgt-input', class extends FidgetElement {
  static observedAttributes = ['label', 'lead-icon', 'trail-icon']
  #value = null
  get value() {
    return this.#value
  }
  set value(value) {
    this.#value = value
    this.shadowRoot.querySelector('input').value = value
  }

  #internals = this.attachInternals()
  constructor() {
    super(template, styles, {delegatesFocus: true})
    this.shadowRoot.addEventListener('input', this)
  }

  attributeChangedCallback(name, old, value) {
    if (!this.shadowRoot) return
    if (name === 'label') {
      this.shadowRoot.querySelector('slot[name=label]').textContent = this.getAttribute('label')
    } else if (name === 'lead-icon') {
      if (value) {
        this.shadowRoot.querySelector('[part=lead-icon]').setAttribute('name', value)
      } else {
        this.shadowRoot.querySelector('[part=lead-icon]').removeAttribute('name')
      }
    } else if (name == 'trail-icon') {
      if (value) {
        this.shadowRoot.querySelector('[part=trail-icon]').setAttribute('name', value)
      } else {
        this.shadowRoot.querySelector('[part=trail-icon]').removeAttribute('name')
      }
    }
  }

  handleEvent(event) {
    this.value = event.target.value
    this.dispatchEvent(new Event('change', { bubbles: true }))
  }


})
