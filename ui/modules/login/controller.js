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
        data: new DataModel(), 
        // user: settings.models.user,
      },
      modelEvents: {
        'data set': 'onDataModelSet',
      },
      modelCallbacks: {
        onDataModelSet: (event, dataModel) => this.onDataModelSet(event, dataModel),
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
    data: this.models.data.parse(),
    user: this.models.user.parse()
  } }
  onDataModelSet(event, dataModel) {
    this.models.user.set({
      subID: event.data.username,
      apiKey: event.data.apiKey,
      isAuthenticated: true,
    })
    return this
  }
  onViewFormValidated(event, view) {
    this.models.data.set({
      username: event.data.username,
      apiKey: event.data.apiKey,
    })
    return this
  }
  startView() {
    this.views.view.render(this.viewData)
    return this
  }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this.startView()
    } else {
      Channels.channel('Application').request('router').navigate('/')
    }
    return this
  }
}
