import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { Favorites as FavoritesModel } from 'utilities/scripts/mvc-framework/models/favorites'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import {
  MediaGrid as MediaGridDefaults,
  Options as OptionsDefaults,
} from './defaults'
import View from './view'
import Channels from 'modules/channels'
import {
  MediaGrid as MediaGridController,
  Loader as LoaderController,
  Error as ErrorController,
} from 'library'

export default class extends Controller {
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
        'ui set:loading': 'onUIModelSetLoading',
        'favorites set': 'onFavoritesModelSet',
        'favorites error': 'onFavoritesModelError',
      },
      modelCallbacks: {
        onUIModelSetLoading: (event, uiModel) => this.onUIModelSetLoading(event, uiModel),
        onFavoritesModelSet: (event, favoritesModel) => this.onFavoritesModelSet(event, favoritesModel),
        onFavoritesModelError: (event, favoritesModel) => this.onFavoritesModelError(event, favoritesModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // mediaGrid: MediaGrid,
        loader: new LoaderController(),
      },
      controllerEvents: {
        'error ready': 'onErrorControllerReady',
        'error accept': 'onErrorControllerAccept',
        'mediaGrid click': 'onMediaGridControllerClick',
      },
      controllerCallbacks: {
        onErrorControllerAccept: (event, errorController) => this.onErrorControllerAccept(event, errorController),
        onMediaGridControllerClick: (event, mediaGridController, mediaGridItemController) => this.onMediaGridControllerClick(event, mediaGridController, mediaGridItemController),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.ui.parse(),
  } }
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
  onFavoritesModelSet(event, favoritesModel) {
    console.log('onFavoritesModelSet')
    this.models.ui.set('loading', false)
    return this.startMediaGridController()
  }
  onFavoritesModelError(event, favoritesModel) {
    this.models.ui.set('loading', false)
    this.startErrorController(event.data)
    return this
  }
  onMediaGridControllerClick(event, mediaGridController, mediaGridItemController) {
    console.log(this.models.favorites.get('favorites').find(
      (favorite) => favorite.image.id === mediaGridItemController.controllers.image.models.ui.get('id')
    ))
    Channels.channel('Application').request('router').navigate(
      `/favorites/${this.models.favorites.get('favorites').find(
        (favorite) => favorite.image.id === mediaGridItemController.controllers.image.models.ui.get('id')
      ).id}`
    )
    return this
  }
  onErrorControllerAccept(event, errorController) {
    this.controllers.error.stop()
    Channels.channel('Application').request('router').navigate('').navigate('/photos')
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
    console.log()
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
