import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        class: 'media-item',
      },
    }, settings), mergeDeep({}, options))
  }
}