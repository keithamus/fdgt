import {css, html} from './helpers.js'
import {StateSet} from './stateset.js'

const globalStyles = css`
  :root, :host {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    font-size: 14px;
    --fidget-bg-1: #39393b;
    --fidget-bg-2: #2d2d2f;
    --fidget-bg-3: #505050;
    --fidget-br-1: #232325;
    --fidget-sh-1: #2e2e30;
    --fidget-sh-2: #aaaaaa;
    --fidget-ac-1: #0ca370;
    --fidget-ac-danger: #e95e3d;
    --fidget-fg-1: #a2a2aa;
    --fidget-radius-1: 3px
  }

  :host {
    display: flex;
    margin: 3px;
    flex: 1;
  }
`

export class FidgetElement extends HTMLElement {
  #abortController = new AbortController()
  get signal() { return this.#abortController.signal }
  
  constructor(template, styles, rootOptions = {}) {
    super()
    if (!this.shadowRoot) this.attachShadow({mode: 'open', ...rootOptions || {}})
    this.shadowRoot.innerHTML ||= template
    this.shadowRoot.adoptedStyleSheets.push(globalStyles)
    this.shadowRoot.adoptedStyleSheets.push(styles)
  }

  attachInternals() {
    const internals = super.attachInternals()
    Object.defineProperty(internals, 'states', {value: new StateSet(this, internals.states)})
    return internals
  }

  connectedCallback() {
    this.#abortController?.abort()
    this.#abortController = new AbortController()
  }

  disconnectedCallback() {
    this.#abortController?.abort()
  }
}
