import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Settings as SettingsModel,
} from './models'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
      },
      modelEvents: {
        'settings set:active': 'onSettingsModelSetActive',
      },
      modelCallbacks: {
        onSettingsModelSetActive: (event, settingsModel) => this.onSettingsModelSetActive(event, settingsModel),
      },
      views: {
        view: new View({
          attributes: options.data.attributes,
        }),
      },
      viewEvents: {
        'view click': 'onViewClick',
      },
      viewCallbacks: {
        onViewClick: (event, view) => this.onViewClick(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
  } }
  onSettingsModelSetActive(event, settingsModel) {
    this.views.view.renderElementAttribute('$element', 'data-active', event.data.active)
    return this
  }
  onViewClick(event, view) {
    if(event.data.href) window.location.hash = event.data.href
    return this
      .emit(
        'click',
        event.data,
        this,
        view,
      )
  }
  toggleActive() {
    this.models.settings.set(!this.models.settings.get('active'))
    return this
  }
  start() {
    this.views.view.renderTextContent('$element', this.options.data.textContent)
    return this
  }
}