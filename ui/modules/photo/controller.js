import { mergeDeep } from 'utilities/scripts'
import { Image as ImageModel } from 'utilities/scripts/mvc-framework/models/images'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Settings as SettingsModel,
  Library as LibraryModel,
} from './models'
import View from './view'
import {
  Navigation as NavigationController,
  MediaItem as MediaItemController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = []) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel({
          defaults: {
            id: options.route.location.hash.fragments[options.route.location.hash.fragments.length - 1]
          }
        }),
        library: new LibraryModel(),
        // user: settings.models.user,
        // image: ImageModel,
      },
      modelEvents: {
        'image set': 'onImageModelSet',
      },
      modelCallbacks: {
        onImageModelSet: (event, imageModel) => this.onImageModelSet(event, imageModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // mediaItem: MediaItemController,
        // navigation: NavigatyionController,
      },
      controllerEvents: {
        'mediaItem click:navigation': 'onMediaItemControllerClickNavigation',
        'navigation click': 'onNavigationClick',
      },
      controllerCallbacks: {
        onMediaItemControllerClickNavigation: (event, mediaItemController) => this.onMediaItemControllerClickNavigation(event, mediaItemController),
        onNavigationClick: (event, navigationController) => this.onNavigationClick(event, navigationController),
      },
    }, settings), mergeDeep({}, options))
  }
  onImageModelSet(event, imageModel) {
    return this.startControllers()
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
        break
      case 'delete':
        break
    }
    return this
  }
  getImageModel() {
    this.models.image.services.get.fetch()
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
      },
    }, {
      library: this.models.library.get('navigation'),
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.navigation.views.view.element)
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
      image: this.models.image.parse(),
      // settings: {},
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