import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'photos',
      },
      template: Template,
      uiElements: {
        header: ':scope > header',
        main: ':scope > main',
      },
    }, settings), mergeDeep({}, options))
  }
}
