const html = String.raw
const css = String.raw
// A small polyfill for CSSStateSet
class StateSet extends Set {
	#el = null
	#existing = null
	constructor(el, existing) {
		super()
		this.#el = el
		this.#existing = existing
	}
	add(state) {
		super.add(state)
		const existing = this.#existing
		if (existing) {
			try {
				existing.add(state)
			} catch {
				existing.add(`--${state}`)
			}
		} else {
			this.#el.setAttribute(`state-${state}`, '')
		}
	}
	delete(state) {
		super.delete(state)
		const existing = this.#existing
		if (existing) {
			existing.delete(state)
			existing.delete(`--${state}`)
		} else {
			this.#el.removeAttribute(`state-${state}`)
		}
	}
	has(state) {
		return super.has(state)
	}
	clear() {
		for(const state of this) this.delete(state)
	}
}

const globalStyles = new CSSStyleSheet()
globalStyles.replaceSync(css`
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
		min-height: 35px;
		min-width: 30px;
	}
`)

class FidgetElement extends HTMLElement {
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

{
	const styles = new CSSStyleSheet()
	styles.replaceSync(css`
		button {
			display: flex;
			width: 100%;
			align-items: center;
			background: var(--fidget-button-bg, var(--fidget-bg-2));
			border-radius: var(--fidget-button-radius, var(--fidget-radius-1));
			margin: 0;
			border: 1px solid var(--fidget-button-br, var(--fidget-br-1));
			box-shadow: 0 1px 1px var(--fidget-button-sh, var(--fidget-sh-1));
			color: var(--fidget-button-fg, var(--fidget-fg-1));
		}
		button:hover {
			background: var(--fidget-button-hover-br, var(--fidget-bg-3));
		}
		button:active {
			background: var(--fidget-button-active-br, var(--fidget-bg-1));
			box-shadow: 0 0 3px var(--fidget-button-active-sh, var(--fidget-sh-1)) inset;
		}
	`)
	const template = html`
		<button part="button">
			<slot name="label"></slot>
		</button>
	`
	customElements.define('fidget-button', class extends FidgetElement {
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
			if (event.type == 'click') this.commit()
		}

		commit() {
		}

	})
}

{
	const styles = new CSSStyleSheet()
	styles.replaceSync(css`
		:host {
			margin: 3px 6px;
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
	`)
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
}

{
	const styles = new CSSStyleSheet()
	styles.replaceSync(css`
		button {
			display: flex;
			width: 100%;
			align-items: center;
			background: var(--fidget-menu-button-bg, var(--fidget-bg-2));
			border-radius: 2px;
			border: 1px solid var(--fidget-menu-button-br, var(--fidget-br-1));
			box-shadow: 0 1px 1px var(--fidget-menu-button-sh, var(--fidget-sh-1));
			color: var(--fidget-menu-button-fg, var(--fidget-fg-1));
		}
		button:hover {
			background: var(--fidget-menu-button-hover-bg, var(--fidget-bg-3));
		}
		svg {
			padding-left: 5px;
			width: 16px;
			transition: rotate 100ms;
			transform-origin: 13px;
		}
		[part=menu] {
			display: flex;
			flex-direction: column;
			position: absolute;
			inset: calc(var(--top, 0px) + 8px) auto auto var(--left, 0px);
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
	`)
	const template = html`
		<button part="button">
			<slot name="label"></slot>
			<svg part="chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
		</button>
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
}

{
	const styles = new CSSStyleSheet()
	styles.replaceSync(css`
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
		button svg {
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
		:host(:where(:state(overflow),:--overflow,[state-overflow])) [part=expand] svg {
			rotate: 180deg;
		}
		:host(:where(:state(reflow-nudge),:--reflow-nudge,[state-reflow-nudge])) [part=expand] svg {
			color: var(--fidget-control-expand-nudge-fg, var(--fidget-ac-danger));
			animation: reflow-nudge 100ms infinite ease-in-out;
		}
		@keyframes reflow-nudge {
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
	`)
	const template = html`
		<button part="grip">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
		</button>
		<slot part="controls"></slot>
		<fidget-menu label="More" part="more-menu">
			<slot part="more"></slot>
		</fidget-menu>
		<i></i>
		<button part="expand">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
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
			if (event.type == 'pointerdown') { this.#startDrag(event) }
			if (event.type == 'ponterenter' && this.showPopover) {
				this.hidePopover()
				this.showPopover()
			}
			if (event.type == 'pointermove' && this.#states.has('dragging')) { this.#move(event) }
			if (event.type == 'click' && event.target.closest('[part=expand]')) {
				if (!this.#states.has('overflow')) {
					this.collapse()
				} else if (!this.#reflow()) {
					this.#states.add('reflow-nudge')
					setTimeout(() => this.#states.delete('reflow-nudge'), 200)
				}
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

		#move(event) {
			this.style.setProperty('--top', `${event.clientY - this.#offsetY}px`, 'important')
			this.style.setProperty('--left', `${event.clientX - this.#offsetX}px`, 'important')
			const rect = this.getBoundingClientRect()
			if (rect.right + 10 >= window.innerWidth) {
				this.#reflow()
			}
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
      const controlsRect = controls.getBoundingClientRect()
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
}
