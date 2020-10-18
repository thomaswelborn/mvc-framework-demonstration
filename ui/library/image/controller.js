import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import { Settings as SettingsModel } from './models'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // ui: settings.models.ui,
        settings: new SettingsModel(),
      },
      views: {
        view: new View(),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
    ui: this.models.ui.parse(),
  } }
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