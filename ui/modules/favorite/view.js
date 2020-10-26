import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'favorite',
      },
      template: Template,
      uiElements: {
        header: ':scope > header',
        buttonClose: ':scope > header > nav > button[data-action="close"]',
        main: ':scope > main',
      },
      uiElementEvents: {
        'buttonClose click': 'onButtonCloseClick',
      },
      uiElementCallbacks: {
        onButtonCloseClick: (event) => this.onButtonCloseClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  onButtonCloseClick(event) {
    return this.emit(
      'buttonClose:click',
      {},
      this,
    )
  }
}