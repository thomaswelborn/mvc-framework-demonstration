import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        class: 'info',
      },
      template: Template,
      uiElements: {
        urlContent: '#info-image-url-content',
        copyButton: 'button[data-action="copy"]',
      },
      uiElementEvents: {
        'urlContent focus': 'onURLContentFocus',
        'copyButton click': 'onCopyButtonClick',
      },
      uiElementCallbacks: {
        onURLContentFocus: (event) => this.onURLContentFocus(event),
        onCopyButtonClick: () => this.onCopyButtonClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  copyURL() {
    this.ui.urlContent.select()
    document.execCommand('copy')
    this.ui.urlContent.blur()
    return this
  }
  onURLContentFocus(event) {
    return this.copyURL()
  }
  onCopyButtonClick(event) {
    return this.copyURL()
  }
}