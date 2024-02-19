import {css, html} from './helpers.js'
import {FidgetElement} from './fdgt-element.js'
import './fdgt-button.js'

const styles = css`
  :host {
    margin: 3px;
    position: relative;
    --fdgt-menu-offset-pos: 7px;
  }

  fdgt-button::part(trail-icon) {
    width: 16px;
    transition: rotate 100ms;
    transform-origin: 13px;
  }

  [part=button] {
    margin: 0;
  }

  [part=menu] {
    display: none;
    padding: 2px;
    position: absolute;
    flex-direction: column;
    inset: calc(var(--top, 0px) + var(--fdgt-menu-offset-pos)) auto auto var(--left, 0px);
    border-radius: 3px;
    border: 1px solid transparent;
    box-shadow: 0 0 8px var(--fdgt-menu-popup-sh, var(--fdgt-sh-2));
    background: var(--fdgt-menu-popup-bg, var(--fdgt-bg-3));
    min-width: 100px;
    color: var(--fdgt-menu-popup-fg, var(--fdgt-fg-1));
  }

  :host(:state(open)) [part=menu] {
    display: flex;
  }

  :host(:state(open)) button, button:active {
    background: var(--fdgt-menu-button-active-br, var(--fdgt-bg-1));
    box-shadow: 0 0 3px var(--fdgt-menu-button-active-sh, var(--fdgt-sh-1)) inset;
  }

  :host(:state(open):is(:not([trail-icon]), [trail-icon=chevron-down])) fdgt-button::part(trail-icon) {
    rotate: 180deg;
  }

  :host(:not([label])[trail-icon]) fdgt-button::part(trail-icon) {
    padding: 0;
  }

  :host [part=menu]:not(:where(:popover-open)) {
    inset: calc(35px + var(--fdgt-menu-offset-pos)) auto auto 0;
  }
`

const template = html`
  <fdgt-button part="button" trail-icon="chevron-down">
    <slot name="label" slot="label"></slot>
  </fdgt-button>
  <div popover="manual" part="menu">
    <slot></slot>
  </div>
`

customElements.define('fdgt-menu', class extends FidgetElement {
  static observedAttributes = ['lead-icon', 'label', 'trail-icon']

  #internals = this.attachInternals()
  #states = this.#internals.states || new StateSet(this)

  constructor() {
    super(template, styles)
    this.shadowRoot.addEventListener('click', this)
  }

  connectedCallback() {
    super.connectedCallback()
    const {signal} = this
    window.addEventListener('keydown', this, {signal})
    window.addEventListener('pointerdown', this, {signal})
  }

  attributeChangedCallback(name, old, value) {
    if (name === 'label') {
      this.shadowRoot.querySelector('slot[name=label]').textContent = value
    } else if (name === 'lead-icon') {
      this.shadowRoot.querySelector('fdgt-button').setAttribute('lead-icon', value)
    } else if (name === 'trail-icon') {
      this.shadowRoot.querySelector('fdgt-button').setAttribute('trail-icon', value)
    }
  }

  handleEvent(event) {
    if (event.type == 'keydown' && event.code === 'Escape') { this.close() }
    if (event.type == 'pointerdown' && !event.composedPath().includes(this)) { this.close() }
    if (event.type == 'click' && event.composedPath().includes(this.shadowRoot.querySelector('[part=button]'))) {
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
    this.#states.add('open')
    menu.showPopover?.()
  }

  close() {
    this.shadowRoot.querySelector('[part=menu]').hidePopover?.()
    this.#states.delete('open')
  }

})
