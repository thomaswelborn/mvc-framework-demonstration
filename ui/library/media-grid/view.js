import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        class: 'media-grid',
      },
    }, settings), mergeDeep({}, options))
  }
}
