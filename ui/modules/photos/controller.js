import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { GetAll as ImagesGetAllModel } from 'api/the-cat-api/models/images'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { Model } from 'mvc-framework/source/MVC'
import {
  GETServiceError as GETServiceErrorDefaults,
  MediaGrid as MediaGridDefaults,
  SelectNavigation as SelectNavigationDefaults,
  Options as OptionsDefaults,
} from './defaults'
import View from './view'
import Channels from 'modules/channels'
import {
  SelectNavigation as SelectNavigationController,
  MediaGrid as MediaGridController,
} from 'library'

export default class extends AsyncController {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model(OptionsDefaults.models.ui)
          .set('page', 0, true),
        mediaGrid: new Model({
          defaults: MediaGridDefaults,
        }),
        // imagesGetAll: ImagesGetAllModel,
      },
      modelEvents: {
        'ui set:page': 'onUIModelSetPage',
        'imagesGetAll ready': 'onImagesGetAllModelReady',
        'imagesGetAll set': 'onImagesGetAllModelSet',
        'imagesGetAll error': 'onImagesGetAllModelError',
      },
      modelCallbacks: {
        onUIModelSetPage: (event, uiModel) => this.onUIModelSetPage(event, uiModel),
        onImagesGetAllModelReady: (event, imagesModel) => this.onImagesGetAllModelReady(event, imagesModel),
        onImagesGetAllModelSet: (event, imagesModel) => this.onImagesGetAllModelSet(event, imagesModel),
        onImagesGetAllModelError: (event, imageSearchModel) => this.onImagesGetAllModelError(event, imageSearchModel),
      },
      views: {
        view: new View(),
      },
      viewEvents: {
        'view headerNavButton:click': 'onViewHeaderNavButtonClick',
      },
      viewCallbacks: {
        onViewHeaderNavButtonClick: (event, view) => this.onViewHeaderNavButtonClick(event, view),
      },
      controllers: {
        // selectNavigation: SelectNavigation,
        // mediaGrid: MediaGrid,
      },
      controllerEvents: {
        'selectNavigation select:change': 'onSelectNavigationControllerSelectChange',
        'selectNavigation subnavigationButton:click': 'onSelectNavigationSubnavigationButtonClick',
        'mediaGrid click': 'onMediaGridControllerClick',
      },
      controllerCallbacks: {
        onSelectNavigationControllerSelectChange: (event, selectNavigationController) => this.onSelectNavigationControllerSelectChange(event, selectNavigationController),
        onSelectNavigationSubnavigationButtonClick: (event, selectNavigationController) => this.onSelectNavigationSubnavigationButtonClick(event, selectNavigationController),
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
  onErrorControllerButtonClick(event, errorController) {
    switch(event.data.action) {
      case 'refresh':
        Channels.channel('Application').request('router')
          .navigate('')
          .navigate(this.models.route.get('location').hash.string)
        break
    }
  }
  onViewHeaderNavButtonClick(event, view) {
    switch(event.data.action) {
      case 'upload':
        Channels.channel('Application').request('router').navigate('/upload')
        break
    }
    return this
  }
  onUIModelSetPage(event, uiModel) {
    return this.startImagesGetAllModel()
  }
  onImagesGetAllModelReady(event, imagesModel) {
    this.models.imagesGetAll.set('images', event.data)
    return this
  }
  onImagesGetAllModelSet(event, imagesModel) {
    this.models.ui.set('loading', false)
    return this.startControllers()
  }
  onImagesGetAllModelError(event, imageSearchModel) {
    this.models.ui.set('loading', false)
    return this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
    })
  }
  onSelectNavigationControllerSelectChange(event, selectNavigationController) {
    this.models.ui.set('order', event.data.value)
    return this
  }
  onSelectNavigationSubnavigationButtonClick(event, selectNavigationController) {
    switch(event.data.action) {
      case 'next':
        this.advancePage(1)
        break
      case 'previous':
        this.advancePage(-1)
        break
    }
    return this
  }
  onMediaGridControllerClick(event, mediaGridController, mediaGridItemController) {
    Channels.channel('Application').request('router').navigate(
      `/photos/${mediaGridItemController.controllers.image.models.ui.get('id')}`
    )
    return this
  }
  startImagesGetAllModel() {
    this.models.ui.set('loading', true)
    this.models.imagesGetAll = new ImagesGetAllModel({}, {
      ui: this.models.ui,
      user: this.models.user,
    })
    this.models.imagesGetAll.services.get.fetch()
    this.resetEvents('model')
    this.models.imagesGetAll.services.get.fetch()
    return this
  }
  startSelectNavigationController() {
    if(this.controllers.selectNavigation) this.controllers.selectNavigation.stop()
    this.controllers.selectNavigation = new SelectNavigationController({
      models: {
        user: this.models.user,
      },
    }, SelectNavigationDefaults).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.selectNavigation.views.view.element)
    return this
  }
  startMediaGridController() {
    if(this.controllers.mediaGrid) this.controllers.mediaGrid.stop()
    this.controllers.mediaGrid = new MediaGridController({
      models: {
        user: this.models.user,
        images: this.models.imagesGetAll,
      },
    }, MediaGridDefaults).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaGrid.views.view.element)
    return this
  }
  
  startControllers() {
    return this
      .startMediaGridController()
      .startSelectNavigationController()
  }
  startView() {
    this.views.view.render()
    return this
  }
  start() {
    if(isAuthenticated(this)) {
      this
        .startView()
        .startImagesGetAllModel()
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
