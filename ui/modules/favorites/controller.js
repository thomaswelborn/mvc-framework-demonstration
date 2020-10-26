import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { Favorites as FavoritesModel } from 'api/the-cat-api/models/favorites'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { Model } from 'mvc-framework/source/MVC'
import {
  GETServiceError as GETServiceErrorDefaults,
  MediaGrid as MediaGridDefaults,
  Options as OptionsDefaults,
} from './defaults'
import View from './view'
import Channels from 'modules/channels'
import { MediaGrid as MediaGridController } from 'library'

export default class extends AsyncController {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model(OptionsDefaults.models.ui),
        mediaGrid: new Model({
          defaults: MediaGridDefaults,
        }),
        // favorites: FavoritesModel,
      },
      modelEvents: {
        'favorites ready': 'onFavoritesModelReady',
        'favorites set': 'onFavoritesModelSet',
        'favorites error': 'onFavoritesModelError',
      },
      modelCallbacks: {
        onFavoritesModelReady: (event, favoriteModel) => this.onFavoritesModelReady(event, favoriteModel),
        onFavoritesModelSet: (event, favoritesModel) => this.onFavoritesModelSet(event, favoritesModel),
        onFavoritesModelError: (event, favoritesModel) => this.onFavoritesModelError(event, favoritesModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // mediaGrid: MediaGrid,
      },
      controllerEvents: {
        'mediaGrid click': 'onMediaGridControllerClick',
      },
      controllerCallbacks: {
        onMediaGridControllerClick: (event, mediaGridController, mediaGridItemController) => this.onMediaGridControllerClick(event, mediaGridController, mediaGridItemController),
      },
    }, settings), mergeDeep({
      controllers: {
        error: GETServiceErrorDefaults,
      },
    }, options))
  }
  get viewData() { return {
    settings: this.models.ui.parse(),
  } }
  
  onFavoritesModelReady(event, favoriteModel) {
    this.models.favorites.set('favorites', event.data)
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
  onFavoritesModelSet(event, favoritesModel) {
    this.models.ui.set('loading', false)
    return this.startMediaGridController()
  }
  onFavoritesModelError(event, favoritesModel) {
    this.models.ui.set('loading', false)
    this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
    })
    return this
  }
  onMediaGridControllerClick(event, mediaGridController, mediaGridItemController) {
    Channels.channel('Application').request('router').navigate(
      `/favorites/${this.models.favorites.get('favorites').find(
        (favorite) => favorite.image.id === mediaGridItemController.controllers.image.models.ui.get('id')
      ).id}`
    )
    return this
  }
  getFavoritesModel() {
    this.models.ui.set('loading', true)
    this.models.favorites.services.get.fetch()
    return this
  }
  startFavoritesModel() {
    this.models.favorites = new FavoritesModel({}, {
      ui: this.models.ui,
      user: this.models.user,
    })
    return this
      .resetEvents('model')
      .getFavoritesModel()
  }
  startMediaGridController() {
    if(this.controllers.mediaGrid) this.controllers.mediaGrid.stop()
    this.controllers.mediaGrid = new MediaGridController({
      models: {
        user: this.models.user,
        images: new Model({
          defaults: {
            images: Object.values(this.models.favorites.get('favorites')).map((favorite) => favorite.image),
          },
        }),
      },
    }, MediaGridDefaults).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaGrid.views.view.element)
    return this
  }
  renderView() {
    this.views.view.render()
    return this
  }
  start() {
    if(isAuthenticated(this)) {
      this
        .renderView()
        .startFavoritesModel()
    } else {
      Channels.channel('Application').request('router')
        .navigate(this.models.ui.get('redirect'))
    }
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
  advancePage(pages) {
    let currentPage = this.models.ui.get('page')
    let nextPage = (currentPage + pages < 0)
    ? 0
    : currentPage + pages
    this.models.ui.set('page', nextPage)
    return this
  }
}
