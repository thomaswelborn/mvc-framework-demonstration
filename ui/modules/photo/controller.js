import { mergeDeep } from 'utilities/scripts'
import { Image as ImageModel } from 'utilities/scripts/mvc-framework/models/images'
import {
  Controller,
  Model,
} from 'mvc-framework/source/MVC'
import {
  Settings as SettingsModel,
} from './models'
import {
  Navigation as NavigationDefaults,
  MediaItem as MediaItemDefaults,
} from './defaults'
import View from './view'
import {
  Navigation as NavigationController,
  MediaItem as MediaItemController,
  Loader as LoaderController,
  Error as ErrorController,
} from 'library'
import Channels from 'modules/channels'

export default class extends Controller {
  constructor(settings = {}, options = []) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        settings: new SettingsModel({
          defaults: {
            id: options.route.location.hash.fragments[options.route.location.hash.fragments.length - 1]
          },
        }),
        navigation: new Model({
          defaults: NavigationDefaults,
        }),
        mediaItem: new Model({
          defaults: MediaItemDefaults,
        }),
        // image: ImageModel,
        // imageDelete: ImageDeleteModel,
      },
      modelEvents: {
        'settings set:loading': 'onSettingsModelSetLoading',
        'image set': 'onImageModelSet',
        'image get:error': 'onImageModelGETError',
        'image delete:success': 'onImageModelDELETESuccess',
      },
      modelCallbacks: {
        onSettingsModelSetLoading: (event, settingsModel) => this.onSettingsModelSetLoading(event, settingsModel),
        onImageModelSet: (event, imageModel) => this.onImageModelSet(event, imageModel),
        onImageModelGETError: (event, imageModel) => this.onImageModelGETError(event, imageModel),
        onImageModelDELETESuccess: (event, imageModel) => this.onImageModelDELETESuccess(event, imageModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // mediaItem: MediaItemController,
        // navigation: NavigatyionController,
        loader: new LoaderController(),
        error: new ErrorController(),
      },
      controllerEvents: {
        'error ready': 'onErrorControllerReady',
        'error accept': 'onErrorControllerAccept',
        'mediaItem click:navigation': 'onMediaItemControllerClickNavigation',
        'navigation click': 'onNavigationClick',
      },
      controllerCallbacks: {
        onErrorControllerReady: (event, errorController) => this.onErrorControllerReady(event, errorController),
        onErrorControllerAccept: (event, errorController) => this.onErrorControllerAccept(event, errorController),
        onMediaItemControllerClickNavigation: (event, mediaItemController) => this.onMediaItemControllerClickNavigation(event, mediaItemController),
        onNavigationClick: (event, navigationController) => this.onNavigationClick(event, navigationController),
      },
    }, settings), mergeDeep({}, options))
    
  }
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
  onImageModelSet(event, imageModel) {
    this.models.settings.set('loading', false)
    return this.startControllers()
  }
  onImageModelGETError(event, imageModel, getService) {
    this.models.settings.set('loading', false)
    this.controllers.error.models.settings.set(event.data)
    return this
  }
  onImageModelDELETESuccess(event, imageModel, deleteService) {
    Channels.channel('Application').request('router').navigate('/photos')
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
  onMediaItemControllerClickNavigation(event, mediaItemController) {
    switch(event.data.action) {
      case 'new':
        this.getImageModel()
        break
      case 'info':
        break
    }
    return this
  }
  onNavigationClick(event, navigationController) {
    switch(event.data.action) {
      case 'close':
        Channels.channel('Application').request('router').navigate('/photos')
        break
      case 'delete':
        this.deleteImageModel()
        break
    }
    return this
  }
  getImageModel() {
    this.models.settings.set('loading', true)
    this.models.image.services.get.fetch()
    return this
  }
  deleteImageModel() {
    this.models.image.services.delete.fetch()
    return this
  }
  renderView() {
    this.views.view.render()
    return this
  }
  startImageModel() {
    this.models.image = new ImageModel({}, {
      user: this.models.user,
      settings: this.models.settings,
    })
    return this
      .resetEvents('model')
      .getImageModel()
  }
  startNavigationController() {
    if(this.controllers.navigation) this.controllers.navigation.stop()
    this.controllers.navigation = new NavigationController({
      models: {
        user: this.models.user,
        ui: this.models.navigation,
      },
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.navigation.views.view.element)
    return this
  }
  startMediaItemController() {
    if(this.controllers.mediaItem) this.controllers.mediaItem.stop()
    this.models.mediaItem.set('image', this.models.image.parse())
    this.controllers.mediaItem = new MediaItemController({
      models: {
        user: this.models.user,
        ui: this.models.mediaItem,
      },
    }, {
      settings: this.models.settings.parse(),
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaItem.views.view.element)
    return this
  }
  startControllers() {
    return this
      .startNavigationController()
      .startMediaItemController()
  }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this
        .renderView()
        .startImageModel()
    } else {
      Channels.channel('Application').request('router')
        .navigate(this.models.settings.get('redirect'))
    }
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}