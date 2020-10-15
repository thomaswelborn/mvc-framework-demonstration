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
        settings: new SettingsModel({
          defaults: options.data,
        }),
      },
      views: {
        view: new View(),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
  } }
  start() {
    this.views.view.render(this.viewData)
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}