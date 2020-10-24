import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { Images as ImagesModel } from 'utilities/scripts/mvc-framework/models/images'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { Model } from 'mvc-framework/source/MVC'
import {
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
        ui: new Model(OptionsDefaults.models.ui),
        mediaGrid: new Model({
          defaults: MediaGridDefaults,
        }),
        // images: ImagesModel,
      },
      modelEvents: {
        'images set': 'onImagesModelSet',
        'images error': 'onImagesModelError',
      },
      modelCallbacks: {
        onImagesModelSet: (event, imagesModel) => this.onImagesModelSet(event, imagesModel),
        onImagesModelError: (event, imageSearchModel) => this.onImagesModelError(event, imageSearchModel),
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
        'selectNavigation button:click': 'onSelectNavigationControllerButtonClick',
        'mediaGrid click': 'onMediaGridControllerClick',
      },
      controllerCallbacks: {
        onSelectNavigationControllerSelectChange: (event, navigationController) => this.onSelectNavigationControllerSelectChange(event, navigationController),
        onSelectNavigationControllerButtonClick: (event, navigationController) => this.onSelectNavigationControllerButtonClick(event, navigationController),
        onMediaGridControllerClick: (event, mediaGridController, mediaGridItemController) => this.onMediaGridControllerClick(event, mediaGridController, mediaGridItemController),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.ui.parse(),
  } }
  onViewHeaderNavButtonClick(event, view) {
    switch(event.data.action) {
      case 'upload':
        Channels.channel('Application').request('router').navigate('/upload')
        break
    }
    return this
  }
  onImagesModelSet(event, imagesModel) {
    this.models.ui.set('loading', false)
    return this
      .startControllers()
      .renderSelectNavigationController()
      .renderMediaGridController()
  }
  onImagesModelError(event, imageSearchModel) {
    this.models.ui.set('loading', false)
    return this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
    })
  }
  onSelectNavigationControllerSelectChange(event, navigationController) {
    this.models.ui.set('order', event.data.value)
    return this
  }
  onSelectNavigationControllerButtonClick(event, navigationController) {
    switch(event.data.action) {
      case 'next':
        // this.models.ui.advancePage(1)
        break
      case 'previous':
        // this.models.ui.advancePage(-1)
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
  getImagesModel() {
    this.models.ui.set('loading', true)
    this.models.images.services.get.fetch()
    return this
  }
  renderSelectNavigationController() {
    this.views.view.renderElement('main', 'afterbegin', this.controllers.selectNavigation.views.view.element)
    return this
  }
  renderMediaGridController() {
    this.views.view.renderElement('main', 'beforeend', this.controllers.mediaGrid.views.view.element)
    return this
  }
  startImagesModel() {
    this.models.images = new ImagesModel({}, {
      ui: this.models.ui,
      user: this.models.user,
    })
    return this
      .resetEvents('model')
      .getImagesModel()
  }
  startSelectNavigationController() {
    if(this.controllers.selectNavigation) this.controllers.selectNavigation.stop()
    this.controllers.selectNavigation = new SelectNavigationController({
      models: {
        user: this.models.user,
      },
    }, SelectNavigationDefaults).start()
    this.resetEvents('controller')
    return this
  }
  startMediaGridController() {
    if(this.controllers.mediaGrid) this.controllers.mediaGrid.stop()
    this.controllers.mediaGrid = new MediaGridController({
      models: {
        user: this.models.user,
        images: this.models.images,
      },
    }, MediaGridDefaults).start()
    this.resetEvents('controller')
    return this
  }
  
  startControllers() {
    return this
      .startSelectNavigationController()
      .startMediaGridController()
  }
  renderView() {
    this.views.view.render()
    return this
  }
  start() {
    if(isAuthenticated(this)) {
      this
        .renderView()
        .startImagesModel()
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
