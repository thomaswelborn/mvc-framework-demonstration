import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        class: 'error',
      },
      template: Template,
      uiElements: {
        nav: ':scope > .error-content > nav',
      },
    }, settings), mergeDeep({}, options))
  }
}