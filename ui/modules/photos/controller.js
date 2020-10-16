import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Settings as SettingsModel,
  Library as LibraryModel,
  Data as DataModel,
} from './models'
import View from './view'
import Channels from 'modules/channels'
import {
  SelectNavigation as SelectNavigationController,
  MediaGrid as MediaGridController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
        library: new LibraryModel(),
        // user: settings.models.user,
        // data: DataModel,
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
        'selectNavigation button:click': 'onSelectNavigationControllerButtonClick',
      },
      controllerCallbacks: {
        onSelectNavigationControllerSelectChange: (event, view) => this.onSelectNavigationControllerSelectChange(event, view),
        onSelectNavigationControllerButtonClick: (event, view) => this.onSelectNavigationControllerButtonClick(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
    data: this.models.data.parse(),
  } }
  
  onSelectNavigationControllerSelectChange(event, view) {
    console.log('onSelectNavigationControllerSelectChange', event.name, event.data)
    this.models.settings.set('order', event.data.value)
    return this
  }
  onSelectNavigationControllerButtonClick(event, view) {
    switch(event.data.action) {
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
  startDataModel() {
    this.models.data = new DataModel({}, {
      settings: this.models.settings,
      user: this.models.user,
    })
    this.resetEvents('model')
    this.getDataModel()
    return this
  }
  startSelectNavigationController() {
    if(this.controllers.selectNavigation) this.controllers.selectNavigation.stop()
    this.controllers.selectNavigation = new SelectNavigationController({
      models: {
        user: this.models.user,
      },
    }, {
      library: this.models.library.get('selectNavigation'),
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'afterbegin', this.controllers.selectNavigation.views.view.element)
    return this
  }
  startMediaGridController() {
    if(this.controllers.mediaGrid) this.controllers.mediaGrid.stop()
    this.controllers.mediaGrid = new MediaGridController({
      models: {
        user: this.models.user,
        data: this.models.data,
      },
    }, {
      library: this.models.library.get('mediaGrid'),
    }).start()
    this.views.view.renderElement('main', 'beforeEnd', this.controllers.mediaGrid.views.view.element)
    return this
  }
  startView() {
    this.views.view.render()
    return this
  }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this
        .startDataModel()
        .startView()
        .startSelectNavigationController()
        .startMediaGridController()
    } else {
      Channels.channel('Application').request('router').navigate('/')
    }
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
