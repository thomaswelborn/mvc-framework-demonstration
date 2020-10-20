import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import { Options as OptionsDefaults } from './defaults'
import View from './view'
import Channels from 'modules/channels'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: setings.models.user,
        ui: new Model(OptionsDefaults.models.ui),
      },
      views: {
        view: new View(),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    user: this.models.user.parse(),
    ui: this.models.ui.parse(),
  } }
  start() {
    if(isAuthenticated(this)) {
      this.views.view.render(this.viewData)
    } else {
      Channels.channel('Application').request('router').navigate(this.models.ui.get('redirect'))
    }
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
