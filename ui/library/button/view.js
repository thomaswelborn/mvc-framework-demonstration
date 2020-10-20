import {
  mergeDeep,
  serializeElementAttributes,
} from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'button',
      attributes: {
        type: 'button',
      },
      uiElements: {},
      uiElementEvents: {
        '$element click': 'onElementClick',
      },
      uiElementCallbacks: {
        onElementClick: (event) => this.onElementClick(event),
      },
      template: Template,
    }, settings), mergeDeep({}, options))
  }
  onElementClick(event) {
    const data = serializeElementAttributes(event.currentTarget.attributes)
    return this
      .emit(
        'click',
        data,
        this
      )
  }
}