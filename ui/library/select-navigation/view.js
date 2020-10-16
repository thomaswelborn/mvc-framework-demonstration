import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'nav',
      attributes: {
        class: 'select-navigation',
      },
      template: Template,
      uiElements: {
        select: ':scope > .form select',
        navButton: ':scope > nav button',
      },
      uiElementEvents: {
        'select change': 'onSelectChange',
        'navButton click': 'onNavButtonClick',
      },

      uiElementCallbacks: {
        onSelectChange: (event) => this.onSelectChange(event),
        onNavButtonClick: (event) => this.onNavButtonClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  onSelectChange(event) {
    return this
      .emit(
        'select:change',
        {
          selected: event.currentTarget.value,
        },
        this,
      )
  }
  onNavButtonClick(event) {
    return this
      .emit(
        'button:click',
        {
          action: event.currentTarget.getAttribute('data-action'),
        },
        this,
      )
  }
}