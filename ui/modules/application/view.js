import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework/views'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'div',
      attributes: {
        id: 'application',
      },
      uiElements: {
        header: ':scope > header',
        headlineAnchor: ':scope > header > h1 > a',
        main: ':scope > main',
      },
      uiElementEvents: {
        'headlineAnchor click': 'onHeadlineAnchorClick',
      },
      uiElementCallbacks: {
        onHeadlineAnchorClick: (event) => this.onHeadlineAnchorClick(event),
      },
      template: Template,
      insert: {
        parent: 'body',
        method: 'afterbegin',
      },
    }, settings), mergeDeep({}, options))
  }
  onHeadlineAnchorClick(event) {
    this.emit(
      'headlineAnchor:click',
      {
        href: event.currentTarget.getAttribute('data-href'),
      },
      this,
    )
    return this
  }
}