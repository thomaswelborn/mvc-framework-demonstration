import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'

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
    }, settings), mergeDeep({}, options))
  }
  onElementClick(event) {
    const data = {
      href: this.element.getAttribute('data-href'),
      action: this.element.getAttribute('data-action'),
      target: this.element.getAttribute('data-target'),
      secondaryAction: this.element.getAttribute('data-secondary-action'),
      secondaryTarget: this.element.getAttribute('data-secondary-target'),
    }
    return this
      .emit(
        'click',
        data,
        this
      )
  }
}