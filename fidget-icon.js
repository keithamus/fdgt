import {css, html} from './helpers.js'
import {FidgetElement} from './fidget-element.js'

const styles = css`
  :host, svg {
    width: 16px;
    height: 16px;
    aspect-ratio: 1/1;
    align-items: center;
  }

  :host([size=24]), :host([size=24]) svg { width: 24px }
  :host([size=32]), :host([size=32]) svg { width: 32px }
  :host(:not([name])), svg { display: none }
  :host([name=close]) [name=close] { display: block }
  :host([name=more]) [name=more] { display: block }
  :host([name=chevron-left]) [name=chevron-left] { display: block }
  :host([name=chevron-right]) [name=chevron-right] { display: block }
  :host([name=grip]) [name=grip] { display: block }
  :host([name=move]) [name=move] { display: block }
`

const template = html`
  <svg role="presentation" name="close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  <svg role="presentation" name="more" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  <svg role="presentation" name="chevron-left" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  <svg role="presentation" name="chevron-down" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  <svg role="presentation" name="grip" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
  <svg role="presentation" name="move" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-move"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
`

customElements.define('fidget-icon', class extends FidgetElement {
  #internals = this.attachInternals()
  constructor() {
    super(template, styles, {delegatesFocus: true})
    this.#internals.role = this.role == 'presentation' ? 'presentation' : 'image'
  }
})
