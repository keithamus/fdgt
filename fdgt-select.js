import {css, html} from './helpers.js'
import {FidgetElement} from './fdgt-element.js'
import './fdgt-button.js'
import './fdgt-menu.js'
import './fdgt-icon.js'

const styles = css`
`

const template = html`
  <fdgt-menu>
    <span slot="label">
      <slot name="label"></slot>
      <slot name="selected-value"></slot>
    </span>
  </fdgt-menu>
`

customElements.define('fdgt-select', class extends FidgetElement {
  static observedAttributes = ['lead-icon', 'label']

  #internals = this.attachInternals()
  #states = this.#internals.states || new StateSet(this)
  #observer = new MutationObserver(() => this.#build())
  #value = null
  get value() {
    return this.#value
  }
  set value(value) {
    this.#value = value
    for (const option of this.querySelector('datalist')?.querySelectorAll('option') || []) {
      if (option.value == value) {
        const selectedValueSlot = this.shadowRoot.querySelector('[name="selected-value"]')
        selectedValueSlot.textContent = `: ${option.textContent}`
        this.shadowRoot.querySelector('fdgt-menu').close()
        this.dispatchEvent(new Event('change', { bubbles: true }))
        break
      }
    }
  }

  constructor() {
    super(template, styles)
  }

  connectedCallback() {
    super.connectedCallback()
    this.#observer.observe(this, { childList: true })
    this.shadowRoot.addEventListener('click', this)
    this.#build()
  }

  attributeChangedCallback(name, old, value) {
    if (name === 'label') this.shadowRoot.querySelector('slot[name=label]').textContent = value
    if (name === 'lead-icon') this.shadowRoot.querySelector('fdgt-menu').setAttribute('lead-icon', value)
  }

  handleEvent(event) {
    if (event.type === 'click') this.#handleClick(event)
  }

  #handleClick(event) {
    const menu = this.shadowRoot.querySelector('fdgt-menu')
    const buttons = [...this.shadowRoot.querySelectorAll('fdgt-button')]
    const button = event.composedPath().find(el => el.tagName == 'FDGT-BUTTON')
    let index = buttons.indexOf(button)
    if (index >= 0 && button?.parentElement === menu) {
      const options = [...this.querySelector('datalist')?.querySelectorAll('option') || []];
      this.value = options[index]?.value
    }
  }

  #build() {
    const children = [];
    for (const opt of this.querySelector('datalist')?.querySelectorAll('option') || []) {
      const button = document.createElement('fdgt-button')
      button.setAttribute('label', opt.textContent)
      if (opt.hasAttribute('lead-icon')) button.setAttribute('lead-icon', opt.getAttribute('lead-icon'))
      if (opt.hasAttribute('trail-icon')) button.setAttribute('trail-icon', opt.getAttribute('trail-icon'))
      button.setAttribute('variant', 'text')
      children.push(button)
    }
    const menu = this.shadowRoot.querySelector('fdgt-menu')
    menu.setAttribute('label', this.getAttribute('label') || 'Select')
    menu.replaceChildren(this.shadowRoot.querySelector('[slot=label]'), ...children)
  }

})
