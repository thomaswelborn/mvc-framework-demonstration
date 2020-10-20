import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'nav',
      attributes: {
        class: 'navigation',
      },
    }, settings), mergeDeep({}, options))
  }
}
