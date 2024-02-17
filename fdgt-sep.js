import {css, html} from './helpers.js'
import {FidgetElement} from './fdgt-element.js'

const styles = css`
  :host {
    display: block;
    width: 0px !important;
    flex: 0;
    border-left: 1px solid var(--fdgt-control-sep-br, var(--fdgt-br-1));
    border-right: 1px solid var(--fdgt-control-sep-sh, var(--fdgt-sh-1));
    margin: 0 4px;
  }
`

customElements.define('fdgt-sep', class extends FidgetElement {
  #internals = this.attachInternals()
  constructor() {
    super('', styles)
    this.#internals.role = 'presentation'
  }
})
