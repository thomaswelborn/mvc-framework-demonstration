import { mergeDeep } from 'utilities/scripts'
import {
  Settings as SettingsModel,
  Data as DataModel,
} from './models'
import { Controller } from 'mvc-framework/source/MVC'
import View from './view'
import Channels from 'modules/channels'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
        data: new DataModel({}, {
          user: settings.models.user.parse(),
        }),
      },
      modelEvents: {
        'settings set:imageReady': 'onSettingsModelSetImageReady',
        'data set': 'onDataModelReady',
      },
      modelCallbacks: {
        onSettingsModelSetImageReady: (event, settingsModel) => this.onSettingsModelSetImageReady(event, settingsModel),
        onDataModelReady: (event, dataModel) => this.onDataModelReady(event, dataModel),
      },
      views: {
        view: new View(),
      },
      viewEvents: {
        'view input': 'onViewInput',
        'view click': 'onViewClick',
      },
      viewCallbacks: {
        onViewInput: (event, view) => this.onViewInput(event, view),
        onViewClick: (event, view) => this.onViewClick(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
  } }
  onSettingsModelSetImageReady(event, settingsModel) {
    return this.startView()
  }
  onDataModelReady(event, dataModel) {
    console.log(event.name, event.data)
    return this
  }
  onViewInput(event, view) {
    const data = new FormData()
    data.set('file', event.data.file)
    data.set('sub_id', this.models.user.get('subID'))
    this.models.settings.set('imageReady', true)
    this.views.view
      .renderElement('uploadImagePreview', 'afterbegin', event.data.image)
    this.models.data.services.post.body = data
    return this
  }
  onViewClick(event, view) {
    this.models.data.services.post.fetch()
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
  stop() {
    this.view.view.autoRemove()
    return this
  }
}