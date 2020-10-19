import { mergeDeep } from 'utilities/scripts'
import {
  Settings as SettingsModel,
} from './models'
import { Controller } from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
        // user: settings.UserModel,
      },
    }, settings), mergeDeep({}, options))
  }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
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