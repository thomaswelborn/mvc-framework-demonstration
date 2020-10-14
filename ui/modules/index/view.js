import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'index',
      },
      template: Template,
      uiElements: {
        headerNavButton: ':scope > header > nav > button',
        order: '#index-order-select',
        main: ':scope > main',
        article: ':scope > main > article',
      },
      uiElementEvents: {
        'order change': 'onOrderChange',
        'headerNavButton click': 'onHeaderNavButtonClick',
      },
      uiElementCallbacks: {
        onOrderChange: (event) => this.onOrderChange(event),
        onHeaderNavButtonClick: (event) => this.onHeaderNavButtonClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  onOrderChange(event) {
    return this
      .emit(
        'order:change',
        {
          order: event.currentTarget.value,
        },
        this,
      )
  }
  onHeaderNavButtonClick(event) {
    return this
      .emit(
        'headerNavButton:click',
        {
          action: event.currentTarget.getAttribute('data-action'),
        },
        this,
      )
  }
}