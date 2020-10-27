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
  SelectNavigation as SelectNavigationDefaults,
  MediaItem as MediaItemDefaults,
} from './defaults'
import View from './view'
import {
  SelectNavigation as SelectNavigationController,
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
        'selectNavigation subnavigationButton:click': 'onSelectNavigationControllerSubnavigationButtonClick',
        'mediaItem click:navigation': 'onMediaItemControllerClickNavigation',
      },
      controllerCallbacks: {
        onSelectNavigationControllerSubnavigationButtonClick: (event, view) => this.onSelectNavigationControllerSubnavigationButtonClick(event, view),
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
  onSelectNavigationControllerSelectChange(event, view) {
    this.models.ui.set('order', event.data.value)
    return this
  }
  onSelectNavigationControllerSubnavigationButtonClick(event, view) {
    switch(event.data.action) {
      case 'new':
        this.getImageSearchModel()
        break
      case 'next':
        this.advancePage(1)
        break
      case 'previous':
        this.advancePage(-1)
        break
    }
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
    this.views.view.renderElement('header', 'afterbegin', this.controllers.selectNavigation.views.view.element)
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