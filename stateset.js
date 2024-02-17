// A small polyfill for CSSStateSet
export class StateSet extends Set {
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
const replaceSync = CSSStyleSheet.prototype.replaceSync
Object.defineProperty(CSSStyleSheet.prototype, 'replaceSync', {
  value: function (text) {
    text = text.replace(/:state\(([^\)]+)\)/g, ':where(:state($1), :--$1, [state-$1])')
    replaceSync.call(this, text)
  }
})
