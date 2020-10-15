import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'profile',
      },
      template: Template,
    }, settings), mergeDeep({}, options))
  }
}
