import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'photo',
      },
      template: Template,
      uiElements: {
        header: ':scope > header',
        main: ':scope > main',
      },
    }, settings), mergeDeep({}, options))
  }
}