import {css, html} from './helpers.js'
import {StateSet} from './stateset.js'

const globalStyles = css`
  :root, :host {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    font-size: 14px;
    --fdgt-bg-1: #39393b;
    --fdgt-bg-2: #2d2d2f;
    --fdgt-bg-3: #505050;
    --fdgt-bg-4: #626262;
    --fdgt-br-1: #232325;
    --fdgt-sh-1: #2e2e30;
    --fdgt-sh-2: #aaaaaa;
    --fdgt-ac-1: #2093fe;
    --fdgt-ac-danger: #e95e3d;
    --fdgt-fg-1: #a2a2aa;
    --fdgt-radius-1: 3px;
    --fdgt-radius-2: 6px;
    --fdgt-focus-ring: 2px solid var(--fdgt-ac-1);
  }

  :host {
    display: flex;
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
    if (this.name) {
      this.dispatchEvent(new Event('request-value', {bubbles:true}))
    }
  }

  disconnectedCallback() {
    this.#abortController?.abort()
  }

  get name() {
    return this.getAttribute('name')
  }
}
