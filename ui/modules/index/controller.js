import { mergeDeep } from 'utilities/scripts'
import { Search as ImageSearchModel } from 'utilities/scripts/mvc-framework/models/images'
import { Controller } from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import {
  Settings as SettingsModel,
  Library as LibraryModel,
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
        // user: settings.models.user,
        settings: new SettingsModel(),
        library: new LibraryModel(),
        // imageSearch: ImageSearchModel
      },
      modelEvents: {
        'imageSearch set': 'onImageSearchModelSet',
      },
      modelCallbacks: {
        onImageSearchModelSet: (event, imageModel) => this.onImageSearchModelSet(event, imageModel),
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
  onImageSearchModelSet(event, imageModel) {
    return this.startControllers()
  }
  onSelectNavigationControllerSelectChange(event, view) {
    this.models.settings.set('order', event.data.value)
    return this
  }
  onSelectNavigationButtonControllerClick(event, view) {
    switch(event.data.action) {
      case 'new':
        this.getImageSearchModel()
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
  getImageSearchModel() {
    this.models.imageSearch.services.get.fetch()
    return this
  }
  renderView() {
    this.views.view.render()
    return this
  }
  startImageSearchModel() {
    this.models.imageSearch = new ImageSearchModel({}, {
      user: this.models.user,
      settings: this.models.settings,
    })
    return this
      .resetEvents('model')
      .getImageSearchModel()
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
      image: this.models.imageSearch.get('images')[0],
      // settings: {},
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaItem.views.view.element)
    return this
  }
  startControllers() {
    return this
      .startSelectNavigationController()
      .startMediaItemController()
  }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this
        .renderView()
        .startImageSearchModel()
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