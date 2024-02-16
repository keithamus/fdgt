import {css, html} from './helpers.js'
import {FidgetElement} from './fidget-element.js'

const styles = css`
  button {
    display: flex;
    width: 100%;
    align-items: center;
    background: var(--fidget-button-bg, var(--fidget-bg-2));
    border-radius: var(--fidget-button-radius, var(--fidget-radius-1));
    margin: 0;
    border: 1px solid var(--fidget-button-br, var(--fidget-br-1));
    box-shadow: 0 1px 1px var(--fidget-button-sh, var(--fidget-sh-1));
    color: var(--fidget-button-fg, var(--fidget-fg-1));
    min-height: 35px;
    min-width: 30px;
  }

  button:hover {
    background: var(--fidget-button-hover-br, var(--fidget-bg-3));
  }

  button:active {
    background: var(--fidget-button-active-br, var(--fidget-bg-1));
    box-shadow: 0 0 3px var(--fidget-button-active-sh, var(--fidget-sh-1)) inset;
  }
`

const template = html`
  <button part="button">
    <fidget-icon part="lead-icon"></fidget-icon>
    <slot name="label"></slot>
    <fidget-icon part="trail-icon"></fidget-icon>
  </button>
`

customElements.define('fidget-button', class extends FidgetElement {
  static observedAttributes = ['label']

  #internals = this.attachInternals()
  #states = this.#internals.states || new StateSet(this)

  constructor() {
    super(template, styles, {delegatesFocus: true})
    this.shadowRoot.addEventListener('click', this)
  }

  attributeChangedCallback(name, value) {
    if (!this.shadowRoot) return
    if (name === 'label') {
      this.shadowRoot.querySelector('slot[name=label]').textContent = this.getAttribute('label')
    } else if (name === 'lead-icon' || name == 'trail-icon') {
      this.shadowRoot.querySelector('[part=icon]').setAttribute('name', value)
    }
  }

  handleEvent(event) {
    if (event.type == 'click') this.commit()
  }

  commit() {
  }

})
