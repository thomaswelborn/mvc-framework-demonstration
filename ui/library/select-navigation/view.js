import {
  mergeDeep,
  serializeElementAttributes,
} from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'nav',
      attributes: {
        class: 'select-navigation',
      },
      uiElements: {
        select: ':scope > select',
        subnavigation: ':scope > .subnavigation',
        subnavigationButton: ':scope > .subnavigation > .button',
      },
      uiElementEvents: {
        'select change': 'onSelectChange',
        'subnavigationButton click': 'onSubnavigationButtonClick',
      },
      uiElementCallbacks: {
        onSelectChange: (event) => this.onSelectChange(event),
        onSubnavigationButtonClick: (event) => this.onSubnavigationButtonClick(event),
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
  onSubnavigationButtonClick(event) {
    return this
      .emit(
        'subnavigationButton:click',
        serializeElementAttributes(event.currentTarget.attributes)
      )
  }
  selectOption(value) {
    this.ui.select
      .querySelector(`:scope > option[value=${value}]`)
      .setAttribute('selected', true)
    return this
  }
}