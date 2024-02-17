import {css, html} from './helpers.js'
import {FidgetElement} from './fdgt-element.js'

const styles = css`
  :host {
    margin: 3px;
  }

  button {
    display: flex;
    width: max-content;
    align-items: center;
    border-radius: var(--fdgt-button-radius, var(--fdgt-radius-1));
    margin: 0;
    color: var(--fdgt-button-fg, var(--fdgt-fg-1));
    min-height: 35px;
    min-width: 30px;
    flex: 1;
    background: var(--fdgt-button-bg, var(--fdgt-bg-2));
    border: 1px solid var(--fdgt-button-br, var(--fdgt-br-1));
    box-shadow: 0 1px 1px var(--fdgt-button-sh, var(--fdgt-sh-1));
    padding: 0 8px;
  }

  [name=label] {
    display: block;
    flex: 1;
    text-align: left;
  }

  :host([variant=text]) button {
    background: none;
    border: 1px solid transparent;
    box-shadow: none;
  }

  button:hover {
    background: var(--fdgt-button-hover-br, var(--fdgt-bg-3));
  }

  :host([variant=text]) button:hover {
    background: var(--fdgt-button-text-hover-br, var(--fdgt-bg-4));
  }

  button:active {
    background: var(--fdgt-button-active-br, var(--fdgt-bg-1));
    box-shadow: 0 0 3px var(--fdgt-button-active-sh, var(--fdgt-sh-1)) inset;
  }

  button:focus-visible {
    outline: var(--fdgt-focus-ring);
  }

  [part=lead-icon] {
    padding-right: 5px;
  }

  [part=trail-icon] {
    padding-left: 5px;
  }
`

const template = html`
  <button part="button">
    <fdgt-icon part="lead-icon"></fdgt-icon>
    <slot name="label"></slot>
    <fdgt-icon part="trail-icon"></fdgt-icon>
  </button>
`

customElements.define('fdgt-button', class extends FidgetElement {
  static observedAttributes = ['label', 'lead-icon', 'trail-icon']

  #internals = this.attachInternals()
  constructor() {
    super(template, styles, {delegatesFocus: true})
    this.shadowRoot.addEventListener('click', this)
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
    if (event.type == 'click') this.commit()
  }

  commit() {
    const el = this.closest('fdgt-control')?.for
    const method = this.getAttribute('call')
    if (el && method && method in el) {
      el[method]()
    }
  }

})
