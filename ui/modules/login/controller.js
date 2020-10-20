import { mergeDeep } from 'utilities/scripts'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import { UI as UIDefaults } from './defaults'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model({
          defaults: UIDefaults,
        }), 
      },
      modelEvents: {
        'ui set': 'onUIModelSet',
        'user set': 'onUserModelSet',
      },
      modelCallbacks: {
        onUIModelSet: (event, uiModel) => this.onUIModelSet(event, uiModel),
        onUserModelSet: (event, userModel) => this.onUserModelSet(event, userModel),
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
    settings: this.models.ui.parse(),
    user: this.models.user.parse()
  } }
  onUIModelSet(event, uiModel) {
    this.models.user.set({
      subID: event.data.username,
      apiKey: event.data.apiKey,
      isAuthenticated: true,
    })
    return this
  }
  onUserModelSet(event, userModel) {
    if(event.data.isAuthenticated) Channels.channel('Application').request('router').navigate('/')
    return this
  }
  onViewFormValidated(event, view) {
    this.models.ui.set({
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
      (this.models.ui.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.ui.get('noAuth') && !this.models.user.get('isAuthenticated'))
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
