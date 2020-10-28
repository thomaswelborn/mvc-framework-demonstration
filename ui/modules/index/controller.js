import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { Search as ImageSearchModel } from 'api/the-cat-api/models/images'
import { UI as UIModel } from './models'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { PostOne as PostOneFavoriteModel } from 'api/the-cat-api/models/favorites'
import { Model } from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import {
  GETServiceError as GETServiceErrorDefaults,
  Options as OptionsDefaults,
  Pagination as PaginationDefaults,
  SelectNavigation as SelectNavigationDefaults,
  MediaItem as MediaItemDefaults,
} from './defaults'
import View from './view'
import {
  SelectNavigation as SelectNavigationController,
  Pagination as PaginationController,
  MediaItem as MediaItemController,
  Info as InfoController,
} from 'library'

export default class extends AsyncController {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        // imageSearch: ImageSearchModel,
        // postOneFavorite: FavoriteModel,
        ui: new Model(OptionsDefaults.models.ui)
          .set('page', 0, true)
          .set('infoSelected', false, true),
      },
      modelEvents: {
        'ui set:infoSelected': 'onUIModelSetInfoSelected',
        'imageSearch set': 'onImageSearchModelSet',
        'imageSearch ready': 'onImageSearchModelReady',
        'imageSearch error': 'onImageSearchModelError',
        'postOneFavorite ready': 'onPostOneFavoriteModelReady',
        'postOneFavorite set': 'onPostOneFavoriteModelSet',
      },
      modelCallbacks: {
        onImageSearchModelSet: (event, imageSearchModel) => this.onImageSearchModelSet(event, imageSearchModel),
        onImageSearchModelReady: (event, imageSearchModel) => this.onImageSearchModelReady(event, imageSearchModel),
        onImageSearchModelError: (event, imageSearchModel) => this.onImageSearchModelError(event, imageSearchModel),
        onPostOneFavoriteModelReady: (event, imageSearchModel) => this.onPostOneFavoriteModelReady(event, imageSearchModel),
        onPostOneFavoriteModelSet: (event, imageSearchModel) => this.onPostOneFavoriteModelSet(event, imageSearchModel),
        onUIModelSetInfoSelected: (event, uiModel) => this.onUIModelSetInfoSelected(event, uiModel),
      },
      views: {
        view: new View(),
      },
      controllers: {},
      controllerEvents: {
        'selectNavigation select:change': 'onSelectNavigationControllerSelectChange',
        'pagination newPage': 'onPaginationControllerNewPage',
        'pagination advancePage': 'onPaginationControllerAdvancePage',
        'pagination refreshPage': 'onPaginationControllerRefreshPage',
        'mediaItem click:navigation': 'onMediaItemControllerClickNavigation',
      },
      controllerCallbacks: {
        onPaginationControllerNewPage: (event, paginationController) => this.onPaginationControllerNewPage(event, paginationController),
        onPaginationControllerAdvancePage: (event, paginationController) => this.onPaginationControllerAdvancePage(event, paginationController),
        onPaginationControllerRefreshPage: (event, paginationController) => this.onPaginationControllerRefreshPage(event, paginationController),
        onSelectNavigationControllerSelectChange: (event, view) => this.onSelectNavigationControllerSelectChange(event, view),
        onMediaItemControllerClickNavigation: (event, mediaItemController) => this.onMediaItemControllerClickNavigation(event, mediaItemController),
      },
    }, settings), mergeDeep({
      controllers: {
        error: GETServiceErrorDefaults,
      },
    }, options))
  }
  onImageSearchModelSet(event, imageSearchModel) {
    this.models.ui.set('loading', false)
    return this
      .startMediaItemController()
      .startPaginationController()
  }
  onImageSearchModelReady(event, imageSearchModel) {
    this.models.imageSearch.set({
      images: event.data,
    })
    return this
  }
  onImageSearchModelError(event, imageSearchModel) {
    this.models.ui.set('loading', false)
    return this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
    })
  }
  onPostOneFavoriteModelReady(event, imageSearchModel) {
    this.models.postOneFavorite.set(event.data)
    return this
  }
  onPostOneFavoriteModelSet(event, imageSearchModel) {
    this.controllers.mediaItem.stopButton('index-media-item-navigation-favorite-button')
    return this
  }
  onUIModelSetInfoSelected(event, uiModel) {
    switch(event.data.value) {
      case true:
        this.startInfoController()
        break
      case false:
        this.stopInfoController()
        break
    }
    return this
  } 
  onPaginationControllerNewPage(event, paginationController) {
    this.models.ui.set('loading', true)
    this.models.ui.set('page', event.data.newPage)
    return this
  }
  onPaginationControllerAdvancePage(event, paginationController) {
    this.models.ui.set('loading', true)
    return this.advancePage(event.data.advance)
  }
  onPaginationControllerRefreshPage(event, paginationController) {
    this.models.ui.set('loading', true)
    return this.refreshPage()
  }
  onSelectNavigationControllerSelectChange(event, selectNavigationController) {
    this.models.ui.set('loading', true)
    this.models.ui.set('order', event.data.value)
    this.models.ui.set('page', 0)
    return this
  }
  onMediaItemControllerClickNavigation(event, mediaItemController) {
    switch(event.data.action) {
      case 'info':
        this.models.ui.set('infoSelected', !this.models.ui.get('infoSelected'))
        break
      case 'favorite':
        this.startPostOneFavoriteModel()
        break
    }
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
  getImageSearchModel() {
    this.models.ui.set('loading', true)
    this.models.imageSearch.services.get.fetch()
    return this
  }
  postFavoriteModel() {
    this.models.postOneFavorite.services.post.fetch()
    return this
  }
  refreshPage(event) {
    this.getImageSearchModel()
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
  startSelectNavigation() {
    if(this.controllers.selectNavigation) this.controllers.selectNavigation.stop()
    this.controllers.selectNavigation = new SelectNavigationController({
      models: {
        user: this.models.user,
      }
    }, SelectNavigationDefaults).start()
    this.views.view.renderElement('footer', 'beforeend', this.controllers.selectNavigation.views.view.element)
    return this
  }
  startPaginationController() {
    if(this.controllers.pagination) this.controllers.pagination.stop()
    this.controllers.pagination = new PaginationController({}, mergeDeep({
      models: {
        ui: {
          defaults: {
            count: this.models.imageSearch.services.get.response.headers.get('pagination-count'),
            limit: this.models.imageSearch.services.get.response.headers.get('pagination-limit'),
            page: this.models.imageSearch.services.get.response.headers.get('pagination-page'),
          },
        },
      },
    }, PaginationDefaults)).start()
    this.resetEvents('controller')
    this.views.view.renderElement('footer', 'beforeend', this.controllers.pagination.views.view.element)
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
              defaults: this.models.imageSearch.get('images')[0],
            }
          },
        },
      }
    })).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaItem.views.view.element)
    return this
  }
  startInfoController() {
    this.stopInfoController()
    this.controllers.info = new InfoController({
      models: {
        ui: new Model({
          defaults: this.models.imageSearch.get('images')[0],
        }),
      },
    }).start()
    this.views.view.renderElement('main', 'afterbegin', this.controllers.info.views.view.element)
    return this
  }
  startView() {
    this.views.view.render()
    return this
  }
  startImageSearchModel() {
    this.models.imageSearch = new ImageSearchModel({}, {
      user: this.models.user,
      ui: this.models.ui,
    })
    return this
      .resetEvents('model')
      .getImageSearchModel()
  }
  startPostOneFavoriteModel() {
    this.models.postOneFavorite = new PostOneFavoriteModel({}, {
      user: this.models.user,
      ui: this.models.ui,
      image: new Model({
        defaults: this.models.imageSearch.get('images').slice(-1)[0],
      }),
    })
    this.resetEvents('model')
    this.models.postOneFavorite.services.post.fetch()
    return this
  }
  start() {
    if(isAuthenticated(this)) {
      this
        .startView()
        .startSelectNavigation()
        .startImageSearchModel()
    } else {
      Channels.channel('Application').request('router')
        .navigate(this.models.ui.get('redirect'))
    }
    return this
  }
  stopInfoController() {
    if(this.controllers.info) this.controllers.info.stop()
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}