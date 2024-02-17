import {css, html} from './helpers.js'
import {FidgetElement} from './fdgt-element.js'

const styles = css`
  :host {
    margin: 3px 6px;
    min-height: 35px;
  }
  label {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  label:focus-visible {
    border-radius: var(--fdgt-switch-radius, var(--fdgt-radius-1));
    outline: var(--fdgt-focus-ring);
  }
  [part=track] {
    display: flex;
    align-items: center;
    width: 40px;
    height: 20px;
    margin: 0 0 0 6px;
    background: var(--fdgt-switch-track-bg, var(--fdgt-ac-1));
    border-radius: 20px;
    box-shadow: 0 0 3px var(--fdgt-switch-track-sh, var(--fdgt-sh-1)) inset;
    transition: color 100ms ease-in-out;
  }
  [part=thumb] {
    display: flex;
    align-items: center;
    height: 25px;
    width: 25px;
    background: var(--fdgt-switch-bg, var(--fdgt-bg-2));
    border-radius: 100%;
    border: 1px solid var(--fdgt-switch-br, var(--fdgt-br-1));
    box-shadow: 0 1px 1px var(--fdgt-switch-sh, var(--fdgt-sh-1));
    color: var(--fdgt-switch-fg, var(--fdgt-fg-1));
    transition: transform 100ms ease-in-out;
  }
  [part=track]:hover [part=thumb] {
    background: var(--fdgt-switch-thumb-hover-br, var(--fdgt-bg-3));
  }
  :host(:not(:where(:state(on),:--on,[state-on]))) [part=track] {
    background: var(--fdgt-switch-track-off-bg, var(--fdgt-ac-danger));
  }
  :host(:where(:state(on),:--on,[state-on])) [part=thumb] {
    transform: translateX(15px);
  }
`

const template = html`
  <label tabindex=0>
    <slot name="label"></slot>
    <div part="track">
      <div part="thumb">
      </div>
    </div>
  </label>
`

customElements.define('fdgt-switch', class extends FidgetElement {
  static observedAttributes = ['label']

  #internals = this.attachInternals()
  #states = this.#internals.states || new StateSet(this)

  constructor() {
    super(template, styles, {delegatesFocus: true})
    this.#internals.role = 'switch'
    this.#internals.ariaChecked = 'false'
    this.shadowRoot.addEventListener('click', this)
    this.shadowRoot.addEventListener('keydown', this)
  }

  attributeChangedCallback(name) {
    if (this.shadowRoot && name === 'label') {
      this.shadowRoot.querySelector('slot[name=label]').textContent = this.getAttribute('label')
    }
  }

  handleEvent(event) {
    if (event.type == 'click') this.toggle(event)
    if (event.type == 'keydown' && (event.code == 'Space' || event.code == 'Enter')) this.toggle(event)
  }

  get value() {
    return this.#states.has('on')
  }

  toggle(event) {
    if (this.#states.has('on')) {
      this.#states.ariaChecked = 'true'
      this.#states.delete('on')
    } else {
      this.#states.ariaChecked = 'false'
      this.#states.add('on')
    }
    this.dispatchEvent(new Event('change', { bubbles: true }))
  }

})
