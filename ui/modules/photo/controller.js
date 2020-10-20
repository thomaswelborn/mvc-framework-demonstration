import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { Image as ImageModel } from 'utilities/scripts/mvc-framework/models/images'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import {
  Navigation as NavigationDefaults,
  MediaItem as MediaItemDefaults,
  Options as OptionsDefaults,
} from './defaults'
import View from './view'
import {
  Navigation as NavigationController,
  MediaItem as MediaItemController,
  Loader as LoaderController,
  Error as ErrorController,
  Info as InfoController,
} from 'library'
import Channels from 'modules/channels'

export default class extends Controller {
  constructor(settings = {}, options = []) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model(mergeDeep(
          OptionsDefaults.models.ui,
          {
            defaults: {
              id: options.route.location.hash.fragments[options.route.location.hash.fragments.length - 1]
            },
          },
        )),
        // image: ImageModel,
        // imageDelete: ImageDeleteModel,
      },
      modelEvents: {
        'ui set:loading': 'onUIModelSetLoading',
        'ui set:infoSelected': 'onUIModelSetInfoSelected',
        'image set': 'onImageModelSet',
        'image get:error': 'onImageModelGETError',
        'image delete:success': 'onImageModelDELETESuccess',
      },
      modelCallbacks: {
        onUIModelSetLoading: (event, uiModel) => this.onUIModelSetLoading(event, uiModel),
        onUIModelSetInfoSelected: (event, uiModel) => this.onUIModelSetInfoSelected(event, uiModel),
        onImageModelSet: (event, imageModel) => this.onImageModelSet(event, imageModel),
        onImageModelGETError: (event, imageModel) => this.onImageModelGETError(event, imageModel),
        onImageModelDELETESuccess: (event, imageModel) => this.onImageModelDELETESuccess(event, imageModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // mediaItem: MediaItemController,
        // navigation: NavigationController,
        navigation: new NavigationController({
          models: {
            user: settings.models.user,
          }
        }, NavigationDefaults).start(),
        loader: new LoaderController(),
        info: new InfoController(),
      },
      controllerEvents: {
        'error accept': 'onErrorControllerAccept',
        'mediaItem click:navigation': 'onMediaItemControllerClickNavigation',
        'navigation click': 'onNavigationClick',
      },
      controllerCallbacks: {
        onErrorControllerAccept: (event, errorController) => this.onErrorControllerAccept(event, errorController),
        onMediaItemControllerClickNavigation: (event, mediaItemController) => this.onMediaItemControllerClickNavigation(event, mediaItemController),
        onNavigationClick: (event, navigationController) => this.onNavigationClick(event, navigationController),
      },
    }, settings), mergeDeep({}, options))
  }
  onUIModelSetLoading(event, uiModel) {
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
  onUIModelSetInfoSelected(event, uiModel) {
    switch(event.data.value) {
      case true:
        this.startInfoController()
        this.controllers.mediaItem.controllers.navigation
        break
      case false:
        this.stopInfoController()
        break
    }
    return this
  }
  onImageModelSet(event, imageModel) {
    this.models.ui.set('loading', false)
    return this
      .startMediaItemController()
      .renderMediaItemController()
  }
  onImageModelGETError(event, imageModel, getService) {
    this.models.ui.set('loading', false)
    this.startErrorController(event.data)
    return this
  }
  onImageModelDELETESuccess(event, imageModel, deleteService) {
    Channels.channel('Application').request('router').navigate('/photos')
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
        this.models.ui.set('infoSelected', !this.models.ui.get('infoSelected'))
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
    this.models.ui.set('loading', true)
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
      ui: this.models.ui,
    })
    return this
      .resetEvents('model')
      .getImageModel()
  }
  renderNavigationController() {
    this.views.view.renderElement('main', 'beforeend', this.controllers.navigation.views.view.element)
    return this
  }
  renderMediaItemController() {
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaItem.views.view.element)
    return this
  }
  startErrorController(data) {
    this.controllers.error = new ErrorController({}, {
      models: {
        ui: {
          defaults: data,
        },
      },
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('$element', 'afterbegin', this.controllers.error.views.view.element)
    return this
  }
  startMediaItemController() {
    if(this.controllers.mediaItem) this.controllers.mediaItem.stop()
    this.controllers.mediaItem = new MediaItemController({
      models: {
        user: this.models.user,
      },
    }, mergeDeep(MediaItemDefaults, {
      controllers: {
        image: {
          models: {
            ui: {
              defaults: this.models.image.parse(),
            }
          },
        },
      }
    })).start()
    this.resetEvents('controller')
    return this
  }
  startInfoController(info) {
    this.controllers.info = new InfoController({
      models: {
        ui: new Model({
          defaults: this.models.image.parse(),
        }),
      },
    }).start()
    this.views.view.renderElement('main', 'afterbegin', this.controllers.info.views.view.element)
    return this
  }
  start() {
    if(isAuthenticated(this)) {
      this
        .renderView()
        .renderNavigationController()
        .startImageModel()
    } else {
      Channels.channel('Application').request('router')
        .navigate(this.models.ui.get('redirect'))
    }
    return this
  }
  stopInfoController() {
    this.controllers.info.stop()
    delete this.controllers.info.stop()
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}