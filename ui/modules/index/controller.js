import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import {
  Settings as SettingsModel,
  Library as LibraryModel,
  Data as DataModel,
} from './models'
import View from './view'
import {
  MediaItem as MediaItemController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
        library: new LibraryModel(),
        // data: DataModel
        // user: settings.models.user,
      },
      modelEvents: {
        'settings set:order': 'onSettingsModelSetOrder',
        'settings set:page': 'onSettingsModelSetPage',
        'data set': 'onDataModelSet',
        'user set': 'onUserModelSet',
      },
      modelCallbacks: {
        onSettingsModelSetOrder: (event, settingsModel) => this.onSettingsModelSetOrder(event, settingsModel),
        onSettingsModelSetPage: (event, settingsModel) => this.onSettingsModelSetPage(event, settingsModel),
        onDataModelSet: (event, dataModel) => this.onDataModelSet(event, dataModel),
        onUserModelSet: (event, userModel) => this.onUserModelSet(event, userModel),
      },
      views: {
        view: new View(),
      },
      viewEvents: {
        'view order:change': 'onViewOrderChange',
        'view headerNavButton:click': 'onViewHeaderNavButtonClick',
      },
      viewCallbacks: {
        onViewOrderChange: (event, view) => this.onViewOrderChange(event, view),
        onViewHeaderNavButtonClick: (event, view) => this.onViewHeaderNavButtonClick(event, view),
      },
      controllers: {
        // mediaItem: MediaItem,
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
    data: this.models.data.parse(),
    user: this.models.user.parse(),
  } }
  
  onSettingsModelSetOrder(event, settingsModel) {
    this.models.data.services.get.parameters.order = event.data.value
    this.getDataModel()
    return this
  }
  onSettingsModelSetPage(event, settingsModel) {
    this.models.data.services.get.parameters.page = event.data.value
    this.getDataModel()
    return this
  }
  onDataModelSet(event, dataModel) {
    this.renderView()
    return this
  }
  onUserModelSet(event, userModel) {
    this.models.data.services.get.headers['x-api-key'] = event.data.apiKey
    this.getDataModel()
    return this
  }
  onViewOrderChange(event, view) {
    this.models.settings.set('order', event.data.order)
    return this
  }
  onViewHeaderNavButtonClick(event, view) {
    let currentPage, nextPage
    switch(event.data.action) {
      case 'new':
        this.getDataModel()
        break
      case 'next':
        currentPage = this.models.settings.get('page')
        nextPage = currentPage + 1
        this.models.settings.set('page', nextPage)
        break
      case 'previous':
        currentPage = this.models.settings.get('page')
        nextPage = (currentPage - 1 >= 0)
          ? currentPage - 1
          : currentPage
        this.models.settings.set('page', nextPage)
        break
    }
    return this
  }
  getDataModel() {
    this.models.data.services.get.fetch()
    return this
  }
  renderView() {
    this.views.view.render(this.viewData)
    this.startMediaItemController()
    return this
  }
  startDataModel() {
    this.models.data = new DataModel({}, {
      user: this.models.user,
      settings: this.models.settings,
    })
    this.resetEvents('model')
    return this
  }
  startMediaItemController() {
    if(this.controllers.mediaItem) this.controllers.mediaItem.stop()
    this.controllers.mediaItem = new MediaItemController({
      models: {
        user: this.models.user,
      },
    }, {
      library: this.models.library.get('mediaItem'),
      data: this.models.data.get('images')[0],
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaItem.views.view.element)
    return this
  }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this
        .startDataModel()
        .getDataModel()
    } else {
      const router = Channels.channel('Application').request('router')
      router.navigate('/account/login')
    }
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}