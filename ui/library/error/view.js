import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        class: 'error',
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
    const data = {}
    const dataHREF = this.element.getAttribute('data-href')
    const dataAction = this.element.getAttribute('data-action')
    const dataTarget = this.element.getAttribute('data-target')
    const dataSecondaryAction = this.element.getAttribute('data-secondary-action')
    const dataSecondaryTarget = this.element.getAttribute('data-secondary-target')
    if(dataHREF) data.dataHREF = dataHREF
    if(dataAction) data.dataAction = dataAction
    if(dataTarget) data.dataTarget = dataTarget
    if(dataSecondaryAction) data.dataSecondaryAction = dataSecondaryAction
    if(dataSecondaryTarget) data.dataSecondaryTarget = dataSecondaryTarget
    return this
      .emit(
        'click',
        data,
        this
      )
  }
}