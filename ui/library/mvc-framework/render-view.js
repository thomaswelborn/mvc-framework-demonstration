import { mergeDeep } from 'utilities/scripts'
import { View } from 'mvc-framework/source/MVC'

export default class extends View {
  constructor(settings = {}, options = {}) {
    super(settings, options)
  }
  renderElementAttribute(element, key, value) {
    this.ui[element].setAttribute(key, value)
    return this
  }
  renderElement(target, method, element) {
    this.ui[target].insertAdjacentElement(method, element)
    return this
  }
  renderTextContent(target, textContent) {
    this.ui[target].innerHTML = textContent
    return this
  }
  render(data = {}) {
    this.element.innerHTML = this.template(data)
    return this
  }
  empty(target) {
    target = target || '$element'
    this.ui[target].innerHTML = ''
    return this
  }
}