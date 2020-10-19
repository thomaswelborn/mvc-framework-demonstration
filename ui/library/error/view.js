import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        class: 'error',
      },
      template: Template,
      uiElements: {
        button: ':scope > .error-content > button',
      },
      uiElementEvents: {
        'button click': 'onButtonClick',
      },
      uiElementCallbacks: {
        onButtonClick: (event) => this.onButtonClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  onButtonClick(event) {
    return this
      .emit(
        'click',
        {
          accept: true,
        },
        this
      )
  }
}