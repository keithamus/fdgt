import {css, html} from './helpers.js'
import {FidgetElement} from './fdgt-element.js'
import './fdgt-button.js'
import './fdgt-menu.js'
import './fdgt-icon.js'
import './fdgt-sep.js'

const styles = css`
  :host {
    --xc: clamp(0px, calc(var(--left, 25px) - var(--offset-x, 0px)), calc(100vw - var(--width, 20px))) !important;
    --yc: max(0px, calc(var(--top, 25px) - var(--offset-y, 0px))) !important;
    position: absolute;
    display: flex;
    border: 1px solid var(--fdgt-control-br, var(--border-1));
    background: var(--figdet-control-bg, var(--fdgt-bg-1));
    color: var(--fdgt-control-fg, var(--fdgt-fg-1));
    box-shadow: 0px 0px 8px var(--fdgt-control-sh, var(--fdgt-sh-2));
    border-radius: 3px;
    margin: 0;
    padding: 0;
    transform: translate3d(var(--xc), var(--yc), 0);
    transition: width 100ms ease-in;
    width: fit-content;
    height: fit-content;
    inset: 0;
    overflow: visible;
    touch-action: none;
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

  button:focus-visible {
    outline: var(--fdgt-focus-ring);
  }

  [part=grip] {
    cursor: move;
  }

  button fdgt-icon {
    vertical-align: middle;
    width: 16px;
    transition: rotate 100ms;
    transform-origin: 8px;
  }

  [part=expand] {
    margin-left: -4px;
  }

  [part=more-menu]::part(button)::part(trail-icon) {
    display: none;
  }

  :host(:state(no-overflow)) fdgt-sep {
    display: none;
  }

  :host(:state(no-overflow)) [part=expand] {
    display: none;
  }

  :host(:state(dragging)) {
    cursor: grabbing;
  }

  :host(:state(overflow)) [part=expand] fdgt-icon {
    rotate: 180deg;
  }

  :host(:not(:state(overflow))) [part=more-menu] {
    display: none;
  }

  :host(:state(reflow-nudge)) [part=expand] fdgt-icon {
    color: var(--fdgt-control-expand-nudge-fg, var(--fdgt-ac-danger));
    animation: nudge 100ms infinite ease-in-out;
  }

  :host(:state(move-nudge)) [part=grip] fdgt-icon {
    color: var(--fdgt-control-move-nudge-fg, var(--fdgt-ac-danger));
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
  <button type="button" part="grip" aria-pressed="false" aria-label="Move toolbar">
    <fdgt-icon name="grip" role="presentation"></fdgt-icon>
  </button>
  <slot part="controls"></slot>
  <fdgt-menu aria-label="More" part="more-menu" trail-icon="more">
    <slot part="more"></slot>
  </fdgt-menu>
  <fdgt-sep></fdgt-sep>
  <button type="button" part="expand" aria-pressed="false" aria-label="Expand">
    <fdgt-icon name="chevron-left" role="presentation"></fdgt-icon>
  </button>
`

customElements.define('fdgt-control', class extends FidgetElement {
  static observedAttributes = ['top', 'left']

  #internals = this.attachInternals()
  #states = this.#internals.states || new StateSet(this)
  #observer = new MutationObserver(() => this.#reflow())
  #sheet = css`
    :host {
      --top: 0px;
      --left: 0px;
      --width: 0px;
      --offset-x: 0px;
      --offset-y: 0px;
    }
  `
  get #style() { return this.#sheet.rules[0].style }


  constructor() {
    super(template, styles, {slotAssignment: 'manual'})
    this.shadowRoot.addEventListener('pointerdown', this)
    this.shadowRoot.addEventListener('pointerenter', this)
    this.shadowRoot.addEventListener('click', this)
    this.shadowRoot.addEventListener('keydown', this)
    this.addEventListener('request-value', this)
    this.addEventListener('change', this)
    this.#internals.role = 'dialog'
    this.#internals.ariaLabel = 'Developer controls'
    // WebKit has a bug in style invalidation for constructed style sheets
    // Setting a style attribute fixes this
    this.style.setProperty('--this-variable-is-for-webkit-style-invalidation-bugs', '1px')
  }

  get for() {
    return this.ownerDocument.getElementById(this.getAttribute('for') || '')
  }

  connectedCallback() {
    super.connectedCallback()
    const {signal} = this
    if (this.showPopover) {
      this.popover = 'manual'
      this.showPopover()
    }
    this.#observer.observe(this, { childList: true })
    signal.addEventListener('abort', () => this.#observer.unobserve(this))
    this.shadowRoot.adoptedStyleSheets.push(this.#sheet)
    if (!this.hasAttribute('top') && !this.hasAttribute('left')) {
      requestAnimationFrame(() => {
        if (!this.for) return
        const rect = this.getBoundingClientRect()
        const forRect = this.for.getBoundingClientRect()
        const marginLeft = getComputedStyle(this.for).getPropertyValue('margin-left')
        const marginRight = getComputedStyle(this.for).getPropertyValue('margin-right')
        const doc = this.ownerDocument.documentElement
        this.#style.setProperty('--offset-x', `-${doc.scrollLeft}px`, 'important')
        this.#style.setProperty('--offset-y', `-${doc.scrollTop}px`, 'important')
        this.#style.setProperty('--top', (forRect.top - (rect.height / 2) + (forRect.height / 2)) + 'px', 'important')
        this.#style.setProperty('--left', `calc(${forRect.right + 10}px + ${marginRight})`, 'important')
        this.#style.setProperty('--width', rect.width + 'px', 'important')
      })
    }
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
    } else if (event.type === 'change') {
      this.#handleChange(event)
    } else if (event.type === 'request-value') {
      this.#handleRequestValue(event)
    }
  }

  attributeChangedCallback(name, old, value) {
    if (name === 'top') {
      if (!Number.isNaN(Number(value))) value += 'px'
      this.#style.setProperty('--top', value, 'important')
    } else if (name === 'left') {
      if (!Number.isNaN(Number(value))) value += 'px'
      this.#style.setProperty('--left', value, 'important')
    }
  }

  #handleGripKey(event) {
    const grip = this.shadowRoot.querySelector('[part=grip]')
    if (event.code == 'Enter' || event.code == 'Space') {
      grip.setAttribute('aria-pressed', 'true')
      grip.querySelector('fdgt-icon').setAttribute('name', 'move')
      grip.addEventListener('focusout', () => {
        grip.setAttribute('aria-pressed', 'false')
        grip.querySelector('fdgt-icon').setAttribute('name', 'grip')
      })
      return
    }
    if (grip.getAttribute('aria-pressed') !== 'true') return
    if (event.code == 'Escape' || event.code == 'Enter' || event.code == 'Space' || event.code == 'Tab') {
      grip.setAttribute('aria-pressed', 'false')
      grip.querySelector('fdgt-icon').setAttribute('name', 'grip')
      return
    }
    let clientX = parseInt(getComputedStyle(this).getPropertyValue('--left')) || 0
    let clientY = parseInt(getComputedStyle(this).getPropertyValue('--top')) || 0
    if (event.code == 'ArrowRight') clientX += 20
    else if (event.code == 'ArrowLeft') clientX -= 20
    else if (event.code == 'ArrowUp') clientY -= 20
    else if (event.code == 'ArrowDown') clientY += 20
    clientX = Math.max(clientX, 0)
    clientY = Math.max(clientY, 0)
    if (!this.#move({ clientX, clientY })) {
      this.#states.add('move-nudge')
      setTimeout(() => this.#states.delete('move-nudge'), 200)
    }
    event.preventDefault()
  }

  #startDrag(event) {
    if (event.buttons !== 1 || !event.target.closest('[part=grip]')) return
    this.#states.add('dragging')
    this.setPointerCapture(event.pointerId)
    this.addEventListener('pointermove', this)
    const rect = this.getBoundingClientRect()
    this.#style.setProperty('--width', `${rect.width}px`, 'important')
    const doc = this.ownerDocument.documentElement
    this.#style.setProperty('--offset-x', `${event.clientX - rect.left - doc.scrollLeft}px`, 'important')
    this.#style.setProperty('--offset-y', `${event.clientY - rect.top - doc.scrollTop}px`, 'important')
    window.addEventListener('pointerup', () => this.#endDrag(), { once: true })
    this.#move(event)
  }

  #move({clientY, clientX}) {
    let rect = this.getBoundingClientRect()
    let pos = rect.x + rect.y
    this.#style.setProperty('--left', `${clientX}px`, 'important')
    this.#style.setProperty('--top', `${clientY}px`, 'important')
    rect = this.getBoundingClientRect()
    if (rect.right + 10 >= window.innerWidth) {
      this.#reflow()
    }
    return pos != (rect.x + rect.y)
  }

  #endDrag() {
    this.removeEventListener('pointermove', this)
    this.#states.delete('dragging')
  }

  #reflow() {
    if (!this.shadowRoot) return
    const controls = this.shadowRoot.querySelector('slot[part=controls]')
    if (this.children.length === 1) {
      controls.assign(...this.children)
      this.#states.add('no-overflow')
      return
    } else {
      this.#states.delete('no-overflow')
    }
    const moreSlot = this.shadowRoot.querySelector('slot[part=more]')
    let len = moreSlot.assignedNodes().length
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
    this.#style.setProperty('--width', `${this.getBoundingClientRect().width}px`, 'important')
    if (didOverflow) {
      this.#states.add('overflow')
    } else {
      this.#states.delete('overflow')
    }
    return len != moreSlot.assignedNodes().length
  }

  #handleChange(event) {
    const el = event.target
    if (el.tagName.startsWith('FDGT-')) {
      const name = el.name;
      const value = el.value;
      if (!name) return
      if (name in this.for) {
        this.for[name] = value
      } else if (typeof value === 'boolean') {
        this.for.toggleAttribute(name, value)
      } else {
        this.for.setAttribute(name, value)
      }
    }
  }

  #handleRequestValue(event) {
    const el = event.target
    if (el.tagName.startsWith('FDGT-')) {
      const name = el.name;
      if (!name) return
      if (typeof this.for[name] === 'boolean') {
        el.value = this.for[name]
      } else {
        const value = this.for.getAttribute(name)
        if (value == name || value == '') {
          el.value = true
        } else if (!this.for.hasAttribute(name)) {
          el.value = false
        } else {
          el.value = this.for.getAttribute(name)
        }
      }
    }
  }


  collapse() {
    this.shadowRoot.querySelector('slot[part=more]').assign(...this.children)
    this.#style.setProperty('--width', `${this.getBoundingClientRect().width}px`, 'important')
    this.#states.add('overflow')
  }

})
