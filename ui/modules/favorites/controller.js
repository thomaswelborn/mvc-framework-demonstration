import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { GetAll as FavoritesGetAllModel } from 'api/the-cat-api/models/favorites'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { Model } from 'mvc-framework/source/MVC'
import {
  GETServiceError as GETServiceErrorDefaults,
  MediaGrid as MediaGridDefaults,
  Options as OptionsDefaults,
  Pagination as PaginationDefaults,
} from './defaults'
import View from './view'
import Channels from 'modules/channels'
import {
  MediaGrid as MediaGridController,
  Pagination as PaginationController,
} from 'library'

export default class extends AsyncController {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model(OptionsDefaults.models.ui)
          .set('page', 0),
        mediaGrid: new Model({
          defaults: MediaGridDefaults,
        }),
        // favorites: FavoritesGetAllModel,
      },
      modelEvents: {
        'favoritesGetAll ready': 'onFavoritesGetAllModelReady',
        'favoritesGetAll set': 'onFavoritesGetAllModelSet',
        'favoritesGetAll error': 'onFavoritesGetAllModelError',
      },
      modelCallbacks: {
        onFavoritesGetAllModelReady: (event, favoriteModel) => this.onFavoritesGetAllModelReady(event, favoriteModel),
        onFavoritesGetAllModelSet: (event, favoritesModel) => this.onFavoritesGetAllModelSet(event, favoritesModel),
        onFavoritesGetAllModelError: (event, favoritesModel) => this.onFavoritesGetAllModelError(event, favoritesModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // mediaGrid: MediaGrid,
      },
      controllerEvents: {
        'pagination newPage': 'onPaginationControllerNewPage',
        'pagination advancePage': 'onPaginationControllerAdvancePage',
        'mediaGrid click': 'onMediaGridControllerClick',
      },
      controllerCallbacks: {
        onPaginationControllerNewPage: (event, paginationController) => this.onPaginationControllerNewPage(event, paginationController),
        onPaginationControllerAdvancePage: (event, paginationController) => this.onPaginationControllerAdvancePage(event, paginationController),
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
  onPaginationControllerNewPage(event, paginationController) {
    this.models.ui.set('loading', true)
    this.models.ui.set('page', event.data.newPage)
    return this
  }
  onPaginationControllerAdvancePage(event, paginationController) {
    this.models.ui.set('loading', true)
    return this.advancePage(event.data.advance)
  }
  onFavoritesGetAllModelReady(event, favoriteModel) {
    this.models.favoritesGetAll.set('favorites', event.data)
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
  onFavoritesGetAllModelSet(event, favoritesModel) {
    this.models.ui.set('loading', false)
    return this
      .startMediaGridController()
      .startPaginationController()
  }
  onFavoritesGetAllModelError(event, favoritesModel) {
    this.models.ui.set('loading', false)
    this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
    })
    return this
  }
  onMediaGridControllerClick(event, mediaGridController, mediaGridItemController) {
    Channels.channel('Application').request('router').navigate(
      `/favorites/${this.models.favoritesGetAll.get('favorites').find(
        (favorite) => favorite.image.id === mediaGridItemController.controllers.image.models.ui.get('id')
      ).id}`
    )
    return this
  }
  startFavoritesGetAllModel() {
    this.models.favoritesGetAll = new FavoritesGetAllModel({}, {
      ui: this.models.ui,
      user: this.models.user,
    })
    this.resetEvents('model')
    this.models.favoritesGetAll.services.get.fetch()
    return this
  }
  startMediaGridController() {
    if(this.controllers.mediaGrid) this.controllers.mediaGrid.stop()
    this.controllers.mediaGrid = new MediaGridController({
      models: {
        user: this.models.user,
        images: new Model({
          defaults: {
            images: Object.values(this.models.favoritesGetAll.get('favorites')).map((favorite) => favorite.image),
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
  startPaginationController() {
    if(this.controllers.pagination) this.controllers.pagination.stop()
    this.controllers.pagination = new PaginationController({}, mergeDeep({
      models: {
        ui: {
          defaults: {
            count: this.models.favoritesGetAll.services.get.response.headers.get('pagination-count'),
            limit: this.models.favoritesGetAll.services.get.response.headers.get('pagination-limit'),
            page: this.models.favoritesGetAll.services.get.response.headers.get('pagination-page'),
          },
        },
      },
    }, PaginationDefaults)).start()
    this.resetEvents('controller')
    this.views.view.renderElement('footer', 'beforeend', this.controllers.pagination.views.view.element)
    return this
  }
  start() {
    if(isAuthenticated(this)) {
      this
        .renderView()
        .startFavoritesGetAllModel()
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
