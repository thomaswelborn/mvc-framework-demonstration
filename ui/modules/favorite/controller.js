import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import {
  DeleteOne as FavoriteDeleteOneModel,
  GetOne as FavoriteGetOneModel,
} from 'api/the-cat-api/models/favorites'
import { GetOne as ImageGetOneModel } from 'api/the-cat-api/models/images'
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
        ui: new Model(OptionsDefaults.models.ui),
        // favorite: FavoriteGetOneModel,
        // favoriteDelete: FavoriteDeleteOneModel,
      },
      modelEvents: {
        'ui set:infoSelected': 'onUIModelSetInfoSelected',
        'favoriteGetOne ready': 'onFavoriteGetOneModelReady',
        'favoriteGetOne set': 'onFavoriteGetOneModelSet',
        'favoriteGetOne error': 'onFavoriteGetOneModelError',
        'favoriteDeleteOne ready': 'onFavoriteDeleteOneModelReady',
        'favoriteDeleteOne error': 'onFavoriteDeleteOneModelReady',
      },
      modelCallbacks: {
        onUIModelSetInfoSelected: (event, uiModel) => this.onUIModelSetInfoSelected(event, uiModel),
        onFavoriteGetOneModelReady: (event, favoriteModel) => this.onFavoriteGetOneModelReady(event, favoriteModel),
        onFavoriteGetOneModelSet: (event, favoriteModel) => this.onFavoriteGetOneModelSet(event, favoriteModel),
        onFavoriteGetOneModelError: (event, favoriteModel) => this.onFavoriteGetOneModelError(event, favoriteModel),
        onFavoriteDeleteOneModelReady: (event, imageModel) => this.onFavoriteDeleteOneModelReady(event, imageModel),
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
        // navigation: NavigationController,
        
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
  onFavoriteGetOneModelReady(event, favoriteModel) {
    this.models.favoriteGetOne.set(event.data)
    return this
  }
  onErrorControllerButtonClick(event, errorController) {
    switch(event.data.action) {
      case 'refresh':
        Channels.channel('Application').request('router')
          .navigate('')
          .navigate(this.models.route.get('location').hash.string)
        break
      case 'favorites':
        Channels.channel('Application').request('router').navigate('/favorites')
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
  onFavoriteGetOneModelSet(event, favoriteModel) {
    this.models.ui.set('loading', false)
    return this.startMediaItemController()
  }
  onFavoriteGetOneModelError(event, favoriteModel, getService) {
    this.models.ui.set('loading', false)
    this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/favorites')
    })
    return this
  }
  onFavoriteDeleteOneModelReady(event, imageModel) {
    this.models.ui.set('loading', false)
    Channels.channel('Application').request('router').navigate('/favorites')
    return this
  }
  onMediaItemControllerClickNavigation(event, mediaItemController) {
    switch(event.data.action) {
      case 'new':
        this.startFavoriteGetOneModel()
        break
      case 'info':
        this.models.ui.set('infoSelected', !this.models.ui.get('infoSelected'))
        break
      case 'delete':
        this.startFavoriteDeleteOneModel()
        break
    }
    return this
  }
  onViewButtonCloseClick(event, view) {
    Channels.channel('Application').request('router').navigate('/favorites')
    return this
  }
  startFavoriteGetOneModel() {
    this.models.ui.set('loading', true)
    this.models.favoriteGetOne = new FavoriteGetOneModel({}, {
      user: this.models.user,
      route: this.models.route,
      ui: this.models.ui,
    })
    this.resetEvents('model')
    this.models.favoriteGetOne.services.get.fetch()
    return this
  }
  startFavoriteDeleteOneModel() {
    this.models.ui.set('loading', true)
    this.models.favoriteDeleteOne = new FavoriteDeleteOneModel({}, {
      user: this.models.user,
      route: this.models.route,
      ui: this.models.ui,
    })
    this.resetEvents('model')
    this.models.favoriteDeleteOne.services.delete.fetch()
    return this
  }
  startImageGetOneModel() {
    this.models.image = new ImageGetOneModel({}, {
      user: this.models.user,
      ui: new Model({
        defaults: {
          id: this.models.favoriteGetOne.get('image_id')
        },
      })
    })
  }
  startView() {
    this.views.view.render()
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
              defaults: this.models.favoriteGetOne.get('image'),
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
          defaults: this.models.favoriteGetOne.parse(),
        }),
      },
    }).start()
    this.views.view.renderElement('main', 'afterbegin', this.controllers.info.views.view.element)
    return this
  }
  start() {
    if(isAuthenticated(this)) {
      this
        .startView()
        .startFavoriteGetOneModel()
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