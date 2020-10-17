import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import { Settings as SettingsModel } from './models'
import View from './view'
import Channels from 'modules/channels'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
        // user: setings.models.user,
      },
      views: {
        view: new View(),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    user: this.models.user.parse(),
    settings: this.models.settings.parse(),
  } }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this.views.view.render(this.viewData)
    } else {
      Channels.channel('Application').request('router').navigate('/account/login')
    }
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
