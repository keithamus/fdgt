import {css, html} from './helpers.js'
import {FidgetElement} from './fidget-element.js'
import './fidget-button.js'

const styles = css`
  :host {
    position: relative;
    --fidget-menu-offset-pos: 7px;
  }

  svg {
    padding-left: 5px;
    width: 16px;
    transition: rotate 100ms;
    transform-origin: 13px;
  }

  [part=button] {
    margin: 0;
  }

  [part=menu] {
    display: flex;
    padding: 2px;
    flex-direction: column;
    position: absolute;
    inset: calc(var(--top, 0px) + var(--fidget-menu-offset-pos)) auto auto var(--left, 0px);
    border-radius: 3px;
    border: 1px solid transparent;
    box-shadow: 0 0 8px var(--fidget-menu-popup-sh, var(--fidget-sh-2));
    background: var(--fidget-menu-popup-bg, var(--fidget-bg-3));
    min-width: 100px;
  }

  :host(:not(:where(:state(open),:--open,[state-open]))) [part=menu] {
    display: none;
  }

  :host(:where(:state(open),:--open,[state-open])) button, button:active {
    background: var(--fidget-menu-button-active-br, var(--fidget-bg-1));
    box-shadow: 0 0 3px var(--fidget-menu-button-active-sh, var(--fidget-sh-1)) inset;
  }

  :host(:where(:state(open),:--open,[state-open])) button svg, button:active svg {
    rotate: 180deg;
  }

  :host [part=menu]:not(:where(:popover-open)) {
    inset: calc(35px + var(--fidget-menu-offset-pos)) auto auto 0;
  }
`

const template = html`
  <fidget-button part="button" trail-icon="chevron-right">
    <slot name="label" slot="label"></slot>
  </fidget-button>
  <div popover="manual" part="menu">
    <slot></slot>
  </div>
`

customElements.define('fidget-menu', class extends FidgetElement {
  static observedAttributes = ['label']

  #internals = this.attachInternals()
  #states = this.#internals.states || new StateSet(this)

  constructor() {
    super(template, styles)
    this.shadowRoot.addEventListener('click', this)
  }

  connectedCallback() {
    const {signal} = this
    window.addEventListener('keydown', this, {signal})
    window.addEventListener('pointerdown', this, {signal})
  }

  attributeChangedCallback(name) {
    if (this.shadowRoot && name === 'label') {
      this.shadowRoot.querySelector('slot[name=label]').textContent = this.getAttribute('label')
    }
  }

  handleEvent(event) {
    if (event.type == 'keydown' && event.code === 'Escape') { this.close() }
    if (event.type == 'pointerdown' && !event.composedPath().includes(this)) { this.close() }
    if (event.type == 'click' && event.target.closest('[part=button]')) {
      if (this.#states.has('open')) {
        this.close()
      } else {
        this.open()
      }
    }
  }

  open() {
    const menu = this.shadowRoot.querySelector('[part=menu]')
    const rect = this.getBoundingClientRect()
    menu.style.setProperty('--top', `${rect.bottom}px`, 'important')
    menu.style.setProperty('--left', `${rect.left}px`, 'important')
    menu.showPopover?.()
    this.#states.add('open')
  }

  close() {
    this.shadowRoot.querySelector('[part=menu]').hidePopover?.()
    this.#states.delete('open')
  }

})
