import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'photos',
      },
      template: Template,
      uiElements: {
        header: ':scope > header',
        headerNavButton: ':scope > header > nav > button[data-action]',
        main: ':scope > main',
      },
      uiElementEvents: {
        'headerNavButton click': 'onHeaderNavButtonClick',
      },
      uiElementCallbacks: {
        onHeaderNavButtonClick: (event) => this.onHeaderNavButtonClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  onHeaderNavButtonClick(event) {
    return this
      .emit(
        'headerNavButton:click',
        {
          action: 'upload',
        },
        this,
      )
  }
}
