import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import {
  Options as OptionsDefaults,
} from './defaults'
import Channels from 'modules/channels'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.UserModel,
        ui: new Model(OptionsDefaults.models.ui),
      },
    }, settings), mergeDeep({}, options))
  }
  start() {
    if(isAuthenticated(this)) {
      this.models.user.set({
        isAuthenticated: false,
        subID: String(),
      })
      Channels.channel('Application').request('router').navigate('/account/login')
    } else {
      Channels.channel('Application').request('router').navigate('/account/login')
    }
  }
  stop() {
    return this
  }
}