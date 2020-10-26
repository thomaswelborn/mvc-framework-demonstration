import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { Favorite as FavoriteModel } from 'api/the-cat-api/models/favorites'
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
        ui: new Model(OptionsDefaults.models.ui),
        // favorite: FavoriteModel,
        // favoriteDelete: FavoriteDeleteModel,
      },
      modelEvents: {
        'ui set:infoSelected': 'onUIModelSetInfoSelected',
        'favorite ready': 'onFavoriteModelReady',
        'favorite set': 'onFavoriteModelSet',
        'favorite error': 'onFavoriteModelGETError',
        'favorite delete:success': 'onFavoriteModelDELETESuccess',
      },
      modelCallbacks: {
        onUIModelSetInfoSelected: (event, uiModel) => this.onUIModelSetInfoSelected(event, uiModel),
        onFavoriteModelReady: (event, favoriteModel) => this.onFavoriteModelReady(event, favoriteModel),
        onFavoriteModelSet: (event, favoriteModel) => this.onFavoriteModelSet(event, favoriteModel),
        onFavoriteModelGETError: (event, favoriteModel) => this.onFavoriteModelGETError(event, favoriteModel),
        onFavoriteModelDELETESuccess: (event, favoriteModel) => this.onFavoriteModelDELETESuccess(event, favoriteModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // mediaItem: MediaItemController,
        // navigation: NavigationController,
        
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
  onFavoriteModelReady(event, favoriteModel) {
    this.models.favorite.set(event.data)
    return this
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
  onFavoriteModelSet(event, favoriteModel) {
    this.models.ui.set('loading', false)
    return this.startMediaItemController()
  }
  onFavoriteModelGETError(event, favoriteModel, getService) {
    this.models.ui.set('loading', false)
    this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/favorites')
    })
    return this
  }
  onFavoriteModelDELETESuccess(event, favoriteModel, deleteService) {
    Channels.channel('Application').request('router').navigate('/favorites')
    return this
  }
  onMediaItemControllerClickNavigation(event, mediaItemController) {
    switch(event.data.action) {
      case 'new':
        this.getFavoriteModel()
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
        Channels.channel('Application').request('router').navigate('/favorites')
        break
      case 'delete':
        this.deleteFavoriteModel()
        break
    }
    return this
  }
  getFavoriteModel() {
    this.models.ui.set('loading', true)
    this.models.favorite.services.get.fetch()
    return this
  }
  deleteFavoriteModel() {
    this.models.favorite.services.delete.fetch()
    return this
  }
  startFavoriteModel() {
    this.models.favorite = new FavoriteModel({}, {
      user: this.models.user,
      route: this.models.route,
      ui: this.models.ui,
    })
    return this
      .resetEvents('model')
      .getFavoriteModel()
  }
  startImageModel() {
    this.models.image = new ImageModel({}, {
      user: this.models.user,
      ui: new Model({
        defaults: {
          id: this.models.favorite.get('image_id')
        },
      })
    })
  }
  startView() {
    this.views.view.render()
    return this
  }
  startNavigationController() {
    if(this.controllers.navigation) this.controllers.navigation.stop()
    this.controllers.navigation = new NavigationController({
      models: {
        user: this.models.user,
      }
    }, NavigationDefaults).start()
    this.views.view.renderElement('main', 'beforeend', this.controllers.navigation.views.view.element)
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
              defaults: this.models.favorite.get('image'),
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
          defaults: this.models.favorite.parse(),
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
        .startNavigationController()
        .startFavoriteModel()
    } else {
      // Channels.channel('Application').request('router')
      //   .navigate(this.models.ui.get('redirect'))
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