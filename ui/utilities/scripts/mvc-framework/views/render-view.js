import { mergeDeep } from 'utilities/scripts'
import { View } from 'mvc-framework/source/MVC'
import ElementsTemplate from 'utilities/scripts/mvc-framework/templates/elements/elements.ejs'
import ElementTemplate from 'utilities/scripts/mvc-framework/templates/elements/element/element.ejs'

const TemplateInclude = (path, data) => {
  return Templates[path](data)
}

const Templates = {
  'element/element': (data) => {
    return ElementTemplate(data, null, TemplateInclude)
  },
  '../elements/elements': (data) => {
    return ElementsTemplate(data, null, TemplateInclude)
  },
}

export default class extends View {
  constructor(settings = {}, options = {}) {
    super(settings, options)
    if(settings.children) this.children = settings.children
  }
  get children() { return this._children }
  set children(children) { this._children = children }
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
  renderChildren() {
    this.element.innerHTML = ElementsTemplate(this.children, null, TemplateInclude)
    return this
  }
  render(data = {}) {
    if(this.template) this.element.innerHTML = this.template(data)
    if(this.children) this.renderChildren()
    return this
  }
  empty(target) {
    target = target || '$element'
    this.ui[target].innerHTML = ''
    return this
  }
  removeElement(queryString) {
    const element = this.ui.$element.querySelector(queryString)
    element.parent.removeChild(element)
    return this
  }
}