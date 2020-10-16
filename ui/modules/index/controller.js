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
  SelectNavigation as SelectNavigationController,
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
        'data set': 'onDataModelSet',
        'user set': 'onUserModelSet',
      },
      modelCallbacks: {
        onDataModelSet: (event, dataModel) => this.onDataModelSet(event, dataModel),
        onUserModelSet: (event, userModel) => this.onUserModelSet(event, userModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // selectNavigation: SelectNavigation,
        // mediaItem: MediaItem,
      },
      controllerEvents: {
        'selectNavigation select:change': 'onSelectNavigationControllerSelectChange',
        'selectNavigation button:click': 'onSelectNavigationButtonControllerClick',
      },
      controllerCallbacks: {
        onSelectNavigationControllerSelectChange: (event, view) => this.onSelectNavigationControllerSelectChange(event, view),
        onSelectNavigationButtonControllerClick: (event, view) => this.onSelectNavigationButtonControllerClick(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
    user: this.models.user.parse(),
  } }
  onDataModelSet(event, dataModel) {
    this.renderView()
    return this
  }
  onUserModelSet(event, userModel) {
    this.getDataModel()
    return this
  }
  onSelectNavigationControllerSelectChange(event, view) {
    this.models.settings.set('order', event.data.value)
    return this
  }
  onSelectNavigationButtonControllerClick(event, view) {
    switch(event.data.action) {
      case 'new':
        this.getDataModel()
        break
      case 'next':
        this.models.settings.advancePage(1)
        break
      case 'previous':
        this.models.settings.advancePage(-1)
        break
    }
    return this
  }
  getDataModel() {
    this.models.data.services.get.fetch()
    return this
  }
  renderView() {
    this.views.view.render()
    this
      .startSelectNavigationController()
      .startMediaItemController()
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
  startSelectNavigationController() {
    if(this.controllers.selectNavigation) this.controllers.selectNavigation.stop()
    this.controllers.selectNavigation = new SelectNavigationController({
      models: {
        user: this.models.user,
      }
    }, {
      library: this.models.library.get('selectNavigation'),
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('header', 'afterbegin', this.controllers.selectNavigation.views.view.element)
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
      this.views.view.render(this.viewData)
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