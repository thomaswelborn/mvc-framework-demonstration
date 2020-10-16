import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'index',
      },
      template: Template,
      uiElements: {
        header: ':scope > header',
        main: ':scope > main',
      },
    }, settings), mergeDeep({}, options))
  }
}