import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'nav',
      attributes: {
        class: 'navigation',
      },
      template: Template,
    }, settings), mergeDeep({}, options))
  }
  render() {
    this.element.innerHTML = Template()
    return this
  }
}
