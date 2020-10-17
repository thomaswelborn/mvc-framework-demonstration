import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import { Settings as SettingsModel } from './models'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(), 
        // user: settings.models.user,
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
        'view form:validated': 'onViewFormValidated',
      },
      viewCallbacks: {
        onViewFormValidated: (event, view) => this.onViewFormValidated(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
    user: this.models.user.parse()
  } }
  onSettingsModelSet(event, settingsModel) {
    this.models.user.set({
      subID: event.data.username,
      apiKey: event.data.apiKey,
      isAuthenticated: true,
    })
    return this
  }
  onViewFormValidated(event, view) {
    this.models.settings.set({
      username: event.data.username,
      apiKey: event.data.apiKey,
    })
    return this
  }
  renderView() {
    this.views.view.render(this.viewData)
    return this
  }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this.renderView()
    } else {
      Channels.channel('Application').request('router').navigate('/')
    }
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
