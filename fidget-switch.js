import {css, html} from './helpers.js'
import {FidgetElement} from './fidget-element.js'

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
  [part=track] {
    display: flex;
    align-items: center;
    width: 80px;
    height: 30px;
    margin: 0 0 0 6px;
    background: var(--fidget-switch-track-bg, var(--fidget-ac-1));
    border-radius: var(--fidget-switch-track-radius, var(--fidget-radius-1));
    box-shadow: 0 0 3px var(--fidget-switch-track-sh, var(--fidget-sh-1)) inset;
    transition: color 100ms ease-in-out;
  }
  [part=thumb] {
    display: flex;
    align-items: center;
    height: 30px;
    width: 40px;
    background: var(--fidget-switch-bg, var(--fidget-bg-2));
    border-radius: var(--fidget-switch-thumb-radius, var(--fidget-radius-1));
    border: 1px solid var(--fidget-switch-br, var(--fidget-br-1));
    box-shadow: 0 1px 1px var(--fidget-switch-sh, var(--fidget-sh-1));
    color: var(--fidget-switch-fg, var(--fidget-fg-1));
    transition: transform 100ms ease-in-out;
  }
  [part=track]:hover [part=thumb] {
    background: var(--fidget-switch-thumb-hover-br, var(--fidget-bg-3));
  }
  :host(:not(:where(:state(on),:--on,[state-on]))) [part=track] {
    background: var(--fidget-switch-track-off-bg, var(--fidget-ac-danger));
  }
  :host(:where(:state(on),:--on,[state-on])) [part=thumb] {
    transform: translateX(40px);
  }
`

const template = html`
  <label>
    <slot name="label"></slot>
    <div part="track">
      <div part="thumb">
      </div>
    </div>
  </label>
`
customElements.define('fidget-switch', class extends FidgetElement {
  static observedAttributes = ['label']

  #internals = this.attachInternals()
  #states = this.#internals.states || new StateSet(this)

  constructor() {
    super(template, styles, {delegatesFocus: true})
    this.shadowRoot.addEventListener('click', this)
  }

  attributeChangedCallback(name) {
    if (this.shadowRoot && name === 'label') {
      this.shadowRoot.querySelector('slot[name=label]').textContent = this.getAttribute('label')
    }
  }

  handleEvent(event) {
    if (event.type == 'click' && event.composedPath().includes(this)) this.toggle(event)
  }

  toggle(event) {
    if (this.#states.has('on')) {
      this.#states.delete('on')
    } else {
      this.#states.add('on')
    }
  }

})
