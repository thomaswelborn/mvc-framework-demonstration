import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'nav',
      attributes: {
        class: 'toggle-navigation',
      },
    }, settings), mergeDeep({}, options))
  }
}