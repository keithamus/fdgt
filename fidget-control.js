import {css, html} from './helpers.js'
import {FidgetElement} from './fidget-element.js'

const styles = css`
  :host {
    --xc: clamp(0px, var(--left, 25px), calc(100vw - var(--width, 20px))) !important;
    --yc: clamp(0px, var(--top, 25px), calc(100vh - 41px)) !important;
    position: absolute;
    display: flex;
    border: 1px solid var(--fidget-control-br, var(--border-1));
    background: var(--figdet-control-bg, var(--fidget-bg-1));
    color: var(--fidget-control-fg, var(--fidget-fg-1));
    box-shadow: 0px 0px 8px var(--fidget-control-sh, var(--fidget-sh-2));
    border-radius: 3px;
    margin: 0;
    padding: 0;
    transform: translate3d(var(--xc), var(--yc), 0);
    transition: width 100ms ease-in;
    width: fit-content;
    height: fit-content;
    inset: 0;
    overflow: visible;
  }

  [part=controls] {
    display: flex;
    flex: 1;
  }

  button {
    appearance: none;
    background: none;
    border: 0;
    position: relative;
    width: 30px;
    height: 40px;
    color: inherit;
  }

  [part=grip] {
    cursor: move;
  }

  button fidget-icon {
    vertical-align: middle;
    width: 16px;
    transition: rotate 100ms;
    transform-origin: 8px;
  }

  [part=expand] {
    margin-left: -4px;
  }

  i {
    display: block;
    border-left: 1px solid var(--fidget-control-sep-br, var(--fidget-br-1));
    border-right: 1px solid var(--fidget-control-sep-sh, var(--fidget-sh-1));
    margin: 0 4px;
  }

  :host(:where(:state(dragging),:--dragging,[state-dragging])) {
    cursor: grabbing;
  }

  :host(:where(:state(overflow),:--overflow,[state-overflow])) [part=expand] fidget-icon {
    rotate: 180deg;
  }

  :host(:where(:state(reflow-nudge),:--reflow-nudge,[state-reflow-nudge])) [part=expand] fidget-icon {
    color: var(--fidget-control-expand-nudge-fg, var(--fidget-ac-danger));
    animation: nudge 100ms infinite ease-in-out;
  }

  :host(:where(:state(move-nudge),:--move-nudge,[state-move-nudge])) [part=grip] fidget-icon {
    color: var(--fidget-control-move-nudge-fg, var(--fidget-ac-danger));
    animation: nudge 100ms infinite ease-in-out;
  }

  @keyframes nudge {
    0% {
      translate: 0;
    }
    25% {
      translate: -2px;
    }
    75% {
      translate: 2px;
    }
  }
`

const template = html`
  <button part="grip" aria-pressed="false" aria-label="Move toolbar">
    <fidget-icon name="grip" role="presentation"></fidget-icon>
  </button>
  <slot part="controls"></slot>
  <fidget-menu aria-label="More" part="more-menu">
    <fidget-icon name="more" role="presentation" slot="label"></fidget-icon>
    <slot part="more"></slot>
  </fidget-menu>
  <i></i>
  <button part="expand" aria-pressed="false" aria-label="Expand">
    <fidget-icon name="chevron-left" role="presentation"></fidget-icon>
  </button>
`

customElements.define('fidget-control', class extends FidgetElement {
  #internals = this.attachInternals()
  #states = this.#internals.states || new StateSet(this)
  #observer = new MutationObserver(() => this.#reflow())
  #offsetX = 0
  #offsetY = 0

  constructor() {
    super(template, styles, {slotAssignment: 'manual'})
    this.shadowRoot.addEventListener('pointerdown', this)
    this.shadowRoot.addEventListener('pointerenter', this)
    this.shadowRoot.addEventListener('click', this)
    this.shadowRoot.addEventListener('keydown', this)
    this.#internals.role = 'toolbar'
  }

  connectedCallback() {
    const {signal} = this
    if (this.showPopover) {
      this.popover = 'manual'
      this.showPopover()
    }
    window.addEventListener('pointermove', this, {signal})
    this.#observer.observe(this, { childList: true })
    signal.addEventListener('abort', () => this.#observer.unobserve(this))
    this.#reflow()
  }

  handleEvent(event) {
    if (event.type == 'pointerdown') {
      this.#startDrag(event)
    } else if (event.type == 'ponterenter' && this.showPopover) {
      this.hidePopover()
      this.showPopover()
    } else if (event.type == 'pointermove' && this.#states.has('dragging')) {
      this.#move(event)
    } else if (event.type == 'keydown' && event.target.closest('[part=grip]')) {
      this.#handleGripKey(event)
    } if (event.type == 'click' && event.target.closest('[part=expand]')) {
      if (!this.#states.has('overflow')) {
        this.collapse()
      } else if (!this.#reflow()) {
        this.#states.add('reflow-nudge')
        setTimeout(() => this.#states.delete('reflow-nudge'), 200)
        this.shadowRoot.querySelector('[part=more-menu]').open()
      }
    }
  }

  #handleGripKey(event) {
    const grip = this.shadowRoot.querySelector('[part=grip]')
    if (event.code == 'Enter' || event.code == 'Space') {
      grip.setAttribute('aria-pressed', 'true')
      grip.addEventListener('focusout', () => grip.setAttribute('aria-pressed', 'false'))
      return
    }
    if (grip.getAttribute('aria-pressed') !== 'true') return
    if (event.code == 'Escape' || event.code == 'Enter' || event.code == 'Space' || event.code == 'Tab') {
      grip.setAttribute('aria-pressed', 'false')
      return
    }
    const rect = this.getBoundingClientRect()
    let clientX = rect.x, clientY = rect.y
    if (event.code == 'ArrowRight') clientX += 20
    if (event.code == 'ArrowLeft') clientX -= 20
    if (event.code == 'ArrowUp') clientY -= 20
    if (event.code == 'ArrowDown') clientY += 20
    if (!this.#move({ clientX, clientY })) {
      this.#states.add('move-nudge')
      setTimeout(() => this.#states.delete('move-nudge'), 200)
    }
  }

  #startDrag(event) {
    if (!event.target.closest('[part=grip]')) return
    this.#states.add('dragging')
    const rect = this.getBoundingClientRect()
    this.style.setProperty('--width', `${rect.width}px`, 'important')
    this.#offsetX = event.clientX - rect.left
    this.#offsetY = event.clientY - rect.top
    window.addEventListener('pointerup', () => this.#endDrag(), { once: true })
    this.#move(event)
  }

  #move({clientY, clientX}) {
    let rect = this.getBoundingClientRect()
    let pos = rect.x + rect.y
    this.style.setProperty('--top', `${clientY - this.#offsetY}px`, 'important')
    this.style.setProperty('--left', `${clientX - this.#offsetX}px`, 'important')
    rect = this.getBoundingClientRect()
    if (rect.right + 10 >= window.innerWidth) {
      this.#reflow()
    }
    return pos != (rect.x + rect.y)
  }

  #endDrag() {
    this.#states.delete('dragging')
  }

  #reflow() {
    if (!this.shadowRoot) return
    const moreSlot = this.shadowRoot.querySelector('slot[part=more]')
    let len = moreSlot.assignedNodes().length
    const controls = this.shadowRoot.querySelector('slot[part=controls]')
    controls.assign()
    const rect = this.getBoundingClientRect()
    let allowableWidth = window.innerWidth - rect.left - rect.width
    let didOverflow = false
    if (allowableWidth > 10) {
      let mainflow = []
      let overflow = []
      for (const el of this.children) {
        if (!overflow.length) {
          mainflow.push(el)
          controls.assign(...mainflow)
          if (controls.getBoundingClientRect().width >= allowableWidth) {
            overflow.push(mainflow.pop())
          }
        } else {
          overflow.push(el)
        }
      }
      didOverflow = overflow.length > 0
      moreSlot.assign(...overflow)
    } else {
      didOverflow = true
      moreSlot.assign(...this.children)
    }
    this.style.setProperty('--width', `${this.getBoundingClientRect().width}px`, 'important')
    if (didOverflow) {
      this.#states.add('overflow')
    } else {
      this.#states.delete('overflow')
    }
    return len != moreSlot.assignedNodes().length
  }

  collapse() {
    this.shadowRoot.querySelector('slot[part=more]').assign(...this.children)
    this.style.setProperty('--width', `${this.getBoundingClientRect().width}px`, 'important')
    this.#states.add('overflow')
  }

})
