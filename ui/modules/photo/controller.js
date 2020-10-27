import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import {
  DeleteOne as ImageDeleteOneModel,
  GetOne as ImageGetOneModel,
} from 'api/the-cat-api/models/images'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { Model } from 'mvc-framework/source/MVC'
import {
  GETServiceError as GETServiceErrorDefaults,
  MediaItem as MediaItemDefaults,
  Options as OptionsDefaults,
} from './defaults'
import View from './view'
import {
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
        // image: ImageGetOneModel,
        // imageDelete: ImageDeleteOneModel,
      },
      modelEvents: {
        'ui set:infoSelected': 'onUIModelSetInfoSelected',
        'imageGetOne set': 'onImageGetOneModelSet',
        'imageGetOne ready': 'onImageGetOneModelReady',
        'imageGetOne error': 'onImageGetOneModelError',
        'imageDeleteOne ready': 'onImageDeleteOneModelReady',
        'imageDeleteOne error': 'onImageDeleteOneModelReady',
      },
      modelCallbacks: {
        onUIModelSetInfoSelected: (event, uiModel) => this.onUIModelSetInfoSelected(event, uiModel),
        onImageGetOneModelReady: (event, imageModel) => this.onImageGetOneModelReady(event, imageModel),
        onImageGetOneModelSet: (event, imageModel) => this.onImageGetOneModelSet(event, imageModel),
        onImageGetOneModelError: (event, imageModel) => this.onImageGetOneModelError(event, imageModel),
        onImageDeleteOneModelReady: (event, imageModel) => this.onImageDeleteOneModelReady(event, imageModel),
      },
      views: {
        view: new View(),
      },
      viewEvents: {
        'view buttonClose:click': 'onViewButtonCloseClick',
      },
      viewCallbacks: {
        onViewButtonCloseClick: (event, view) => this.onViewButtonCloseClick(event, view),
      },
      controllers: {
        // mediaItem: MediaItemController,
        info: new InfoController(),
      },
      controllerEvents: {
        'mediaItem click:navigation': 'onMediaItemControllerClickNavigation',
      },
      controllerCallbacks: {
        onMediaItemControllerClickNavigation: (event, mediaItemController) => this.onMediaItemControllerClickNavigation(event, mediaItemController),
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
      case 'photos':
        Channels.channel('Application').request('router')
          .navigate('/photos')
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
  onImageGetOneModelReady(event, imageModel) {
    this.models.imageGetOne.set(event.data)
    return this
  }
  onImageGetOneModelSet(event, imageModel) {
    this.models.ui.set('loading', false)
    return this.startMediaItemController()
  }
  onImageGetOneModelError(event, imageModel, getService) {
    this.models.ui.set('loading', false)
    this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
    })
    return this
  }
  onImageDeleteOneModelReady(event, imageModel) {
    this.models.ui.set('loading', false)
    Channels.channel('Application').request('router').navigate('/photos')
    return this
  }
  onMediaItemControllerClickNavigation(event, mediaItemController) {
    switch(event.data.action) {
      case 'new':
        this.startImageGetOneModel()
        break
      case 'info':
        this.models.ui.set('infoSelected', !this.models.ui.get('infoSelected'))
        break
      case 'delete':
        this.startImageDeleteOneModel()
        break
    }
    return this
  }
  onViewButtonCloseClick(event, view) {
    Channels.channel('Application').request('router').navigate('/photos')
    return this
  }
  renderView() {
    this.views.view.render()
    return this
  }
  startImageDeleteOneModel() {
    this.models.ui.set('loading', true)
    this.models.imageDeleteOne = new ImageDeleteOneModel({}, {
      user: this.models.user,
      ui: this.models.ui,
    })
    this.resetEvents('model')
    this.models.imageDeleteOne.services.delete.fetch()
    return this
  }
  startImageGetOneModel() {
    this.models.ui.set('loading', true)
    this.models.imageGetOne = new ImageGetOneModel({}, {
      user: this.models.user,
      ui: this.models.ui,
    })
    this.resetEvents('model')
    this.models.imageGetOne.services.get.fetch()
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
              defaults: this.models.imageGetOne.parse(),
            }
          },
        },
      }
    })).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaItem.views.view.element)
    return this
  }
  startInfoController(info) {
    this.controllers.info = new InfoController({
      models: {
        ui: new Model({
          defaults: this.models.imageGetOne.parse(),
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
        .startImageGetOneModel()
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