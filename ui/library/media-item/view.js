import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        class: 'media-item',
      },
      uiElements: {},
      uiElementEvents: {
        '$element click': 'onElementClick',
      },
      uiElementCallbacks: {
        onElementClick: (event) => this.onElementClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  onElementClick(event) {
    return this
      .emit(
        'click',
        {},
        this,
      )
  }
}