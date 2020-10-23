import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { Search as ImageSearchModel } from 'utilities/scripts/mvc-framework/models/images'
import { UI as UIModel } from './models'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { Save as SaveFavoriteModel } from 'utilities/scripts/mvc-framework/models/favorites'
import { Model } from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import {
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
        // saveFavorite: FavoriteModel,
        ui: new Model(OptionsDefaults.models.ui),
      },
      modelEvents: {
        'imageSearch set': 'onImageSearchModelSet',
        'imageSearch error': 'onImageSearchModelError',
        'saveFavorite set': 'onSaveFavoriteModelSet',
        'ui set:infoSelected': 'onUIModelSetInfoSelected',
      },
      modelCallbacks: {
        onImageSearchModelSet: (event, imageSearchModel) => this.onImageSearchModelSet(event, imageSearchModel),
        onImageSearchModelError: (event, imageSearchModel) => this.onImageSearchModelError(event, imageSearchModel),
        onSaveFavoriteModelSet: (event, imageSearchModel) => this.onSaveFavoriteModelSet(event, imageSearchModel),
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
    }, settings), mergeDeep({}, options))
    console.log(this.modelEvents)
  }
  onImageSearchModelSet(event, imageSearchModel) {
    console.log('onImageSearchModelSet')
    this.models.ui.set('loading', false)
    return this
      .startMediaItemController()
  }
  onImageSearchModelError(event, imageSearchModel) {
    console.log('onImageSearchModelError')
    this.models.ui.set('loading', false)
    return this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
    })
  }
  onSaveFavoriteModelSet(event, imageSearchModel) {
    console.log('onSaveFavoriteModelSet')
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
        this.startSaveFavoriteModel()
        break
    }
    return this
  }
  getImageSearchModel() {
    this.models.ui.set('loading', true)
    this.models.imageSearch.services.get.fetch()
    console.log('getImageSearchModel')
    return this
  }
  postFavoriteModel() {
    this.models.saveFavorite.services.post.fetch()
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
  startSaveFavoriteModel() {
    this.models.saveFavorite = new SaveFavoriteModel({}, {
      user: this.models.user,
      ui: this.models.ui,
      image: new Model({
        defaults: this.models.imageSearch.get('images').slice(-1)[0],
      }),
    })
    return this
      .resetEvents('model')
      .postFavoriteModel()
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