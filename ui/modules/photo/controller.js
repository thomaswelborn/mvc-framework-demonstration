import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { Image as ImageModel } from 'api/the-cat-api/models/images'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { Model } from 'mvc-framework/source/MVC'
import {
  GETServiceError as GETServiceErrorDefaults,
  Navigation as NavigationDefaults,
  MediaItem as MediaItemDefaults,
  Options as OptionsDefaults,
} from './defaults'
import View from './view'
import {
  Navigation as NavigationController,
  MediaItem as MediaItemController,
  Info as InfoController,
} from 'library'
import Channels from 'modules/channels'

export default class extends AsyncController {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        // route: settings.models.route,
        ui: new Model(mergeDeep(
          OptionsDefaults.models.ui,
          {
            defaults: {
              id: settings.models.route.get('location').hash.fragments[
                settings.models.route.get('location').hash.fragments.length - 1
              ],
            },
          },
        )),
        // image: ImageModel,
        // imageDelete: ImageDeleteModel,
      },
      modelEvents: {
        'ui set:infoSelected': 'onUIModelSetInfoSelected',
        'image set': 'onImageModelSet',
        'image ready': 'onImageModelReady',
        'image error': 'onImageModelGETError',
        'image get:error': 'onImageModelGETError',
        'image delete:success': 'onImageModelDELETESuccess',
      },
      modelCallbacks: {
        onUIModelSetInfoSelected: (event, uiModel) => this.onUIModelSetInfoSelected(event, uiModel),
        onImageModelReady: (event, imageModel) => this.onImageModelReady(event, imageModel),
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
        info: new InfoController(),
      },
      controllerEvents: {
        'mediaItem click:navigation': 'onMediaItemControllerClickNavigation',
        'navigation click': 'onNavigationClick',
      },
      controllerCallbacks: {
        onMediaItemControllerClickNavigation: (event, mediaItemController) => this.onMediaItemControllerClickNavigation(event, mediaItemController),
        onNavigationClick: (event, navigationController) => this.onNavigationClick(event, navigationController),
      },
    }, settings), mergeDeep({
      controllers: {
        error: GETServiceErrorDefaults,
      },
    }, options))
    
  }
  onErrorControllerButtonClick(event, errorController) {
    switch(event.data.action) {
      case 'refresh':
        Channels.channel('Application').request('router')
          .navigate('')
          .navigate(this.models.route.get('location').hash.string)
        break
    }
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
  onImageModelReady(event, imageModel) {
    this.models.image.set(event.data)
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
    this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
    })
    return this
  }
  onImageModelDELETESuccess(event, imageModel, deleteService) {
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