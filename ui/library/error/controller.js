import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import { Settings as SettingsModel } from './models'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
      },
      modelEvents: {
        'settings set': 'onSettingsModelSet',
      },
      modelCallbacks: {
        onSettingsModelSet: (event, settingsModel) => this.onSettingsModelSet(event, settingsModel),
      },
      views: {
        view: new View(),
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
  onSettingsModelSet(event, settingsModel) {
    return this
      .renderView()
      .emit(
        'ready',
        {},
        this,
      )
  }
  onViewClick(event, view) {
    if(event.data.href) window.location.hash = event.data.href
    return this
      .emit(
        'accept',
        {},
        this,
        view,
      )
  }
  renderView() {
    this.views.view.render(this.viewData)
    return this
  }
  start() {
    return this.renderView()
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}