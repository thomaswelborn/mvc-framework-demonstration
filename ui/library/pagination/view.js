import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'nav',
      attributes: {
        class: 'pagination',
      },
      template: Template,
      uiElements: {
        paginationPageInput: ':scope #pagination-page-input',
        paginationButton: ':scope button',
      },
      uiElementEvents: {
        'paginationPageInput change': 'onPaginationPageInputChange',
        'paginationButton click': 'onPaginationButtonClick',
      },
      uiElementCallbacks: {
        onPaginationPageInputChange: (event) => this.onPaginationPageInputChange(event),
        onPaginationButtonClick: (event) => this.onPaginationButtonClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  onPaginationPageInputChange(event) {
    if(event.currentTarget.value !== null) {
      const min = Number(event.currentTarget.getAttribute('min'))
      const max = Number(event.currentTarget.getAttribute('max'))
      let newPage = Number(event.currentTarget.value)
      console.log('newPage', newPage)
      if(newPage < min) {
        newPage = min
      } else if(newPage > max) {
        newPage = max
      } else {
        newPage = newPage
      }
      this.emit('newPage', {
        newPage: newPage - 1,
      }, this)
    }
    return this
  }
  onPaginationButtonClick(event) {
    switch(event.currentTarget.getAttribute('data-action')) {
      case 'refreshPage': 
        this.emit(
          'refreshPage', 
          {},
          this,
        )
        break
      case 'advancePage':
        this.emit(
          'advancePage', 
          {
            advance: Number(event.currentTarget.getAttribute('data-advance')),
          },
          this,
        )
        break
    }
    return 
  }
}
