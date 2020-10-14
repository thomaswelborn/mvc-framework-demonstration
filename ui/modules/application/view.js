import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        id: 'application',
      },
      uiElements: {
        header: ':scope > header',
        main: ':scope > main',
      },
      template: Template,
      insert: {
        parent: 'body',
        method: 'afterbegin',
      },
    }, settings), mergeDeep({}, options))
  }
}