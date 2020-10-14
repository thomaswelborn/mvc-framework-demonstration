import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import {
  Settings as SettingsModel,
  Data as DataModel,
} from './models'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
        data: new DataModel({}, {
          user: settings.models.user,
        }),
      },
      views: {
        view: new View(),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
    data: this.models.data.parse(),
  } }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.isAuthenticated) ||
      (this.models.settings.get('noAuth') && !this.models.user.isAuthenticated)
    ) {
      this.views.view.render(this.viewData)
    } else {
      const router = Channels.channel('Application').request('router')
      router.navigate('/account/login')
    }
    return this
  }
}