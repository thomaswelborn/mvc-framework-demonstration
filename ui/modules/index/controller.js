import { mergeDeep } from 'utilities/scripts'
import { Search as ImageSearchModel } from 'utilities/scripts/mvc-framework/models/images'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import { Settings as SettingsModel } from './models'
import {
  SelectNavigation as SelectNavigationDefaults,
  MediaItem as MediaItemDefaults,
} from './defaults'
import View from './view'
import {
  SelectNavigation as SelectNavigationController,
  MediaItem as MediaItemController,
  Loader as LoaderController,
  Error as ErrorController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        settings: new SettingsModel(),
        selectNavigation: new Model({
          defaults: SelectNavigationDefaults,
        }),
        mediaItem: new Model({
          defaults: MediaItemDefaults,
        }),
        // imageSearch: ImageSearchModel
      },
      modelEvents: {
        'settings set:loading': 'onSettingsModelSetLoading',
        'imageSearch set': 'onImageSearchModelSet',
        'imageSearch get:error': 'onImageSearchModelGetError',
      },
      modelCallbacks: {
        onSettingsModelSetLoading: (event, settingsModel) => this.onSettingsModelSetLoading(event, settingsModel),
        onImageSearchModelSet: (event, imageSearchModel) => this.onImageSearchModelSet(event, imageSearchModel),
        onImageSearchModelGetError: (event, imageSearchModel) => this.onImageSearchModelGetError(event, imageSearchModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // selectNavigation: SelectNavigation,
        // mediaItem: MediaItem,
        loader: new LoaderController(),
        error: new ErrorController(),
      },
      controllerEvents: {
        'error ready': 'onErrorControllerReady',
        'error accept': 'onErrorControllerAccept',
        'selectNavigation select:change': 'onSelectNavigationControllerSelectChange',
        'selectNavigation button:click': 'onSelectNavigationButtonControllerClick',
      },
      controllerCallbacks: {
        onErrorControllerReady: (event, errorController) => this.onErrorControllerReady(event, errorController),
        onErrorControllerAccept: (event, errorController) => this.onErrorControllerAccept(event, errorController),
        onSelectNavigationControllerSelectChange: (event, view) => this.onSelectNavigationControllerSelectChange(event, view),
        onSelectNavigationButtonControllerClick: (event, view) => this.onSelectNavigationButtonControllerClick(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
    user: this.models.user.parse(),
  } }
  onSettingsModelSetLoading(event, settingsModel) {
    switch(event.data.value) {
      case true:
        this.controllers.loader.start()
        this.views.view.renderElement('$element', 'afterbegin', this.controllers.loader.views.view.element)
        break
      case false:
        this.controllers.loader.stop()
        break
    }
    return this
  }
  onImageSearchModelSet(event, imageSearchModel) {
    this.models.settings.set('loading', false)
    return this.startControllers()
  }
  onImageSearchModelGetError(event, imageSearchModel) {
    this.models.settings.set('loading', false)
    this.controllers.error.models.settings.set(event.data)
    return this
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
  onErrorControllerReady(event, errorController) {
    this.views.view.renderElement('main', 'afterbegin', this.controllers.error.views.view.element)
    return this
  }
  onErrorControllerAccept(event, errorController) {
    this.controllers.error.stop()
    Channels.channel('Application').request('router').navigate('/photos')
    return this
  }
  getImageSearchModel() {
    console.log('loading', true)
    this.models.settings.set('loading', true)
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
        ui: this.models.selectNavigation,
      }
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('header', 'afterbegin', this.controllers.selectNavigation.views.view.element)
    return this
  }
  startMediaItemController() {
    if(this.controllers.mediaItem) this.controllers.mediaItem.stop()
    this.models.mediaItem.set('image', this.models.imageSearch.get('images')[0])
    this.controllers.mediaItem = new MediaItemController({
      models: {
        user: this.models.user,
        ui: this.models.mediaItem,
      },
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