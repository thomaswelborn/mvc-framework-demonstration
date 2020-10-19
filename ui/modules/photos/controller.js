import { mergeDeep } from 'utilities/scripts'
import { Images as ImagesModel } from 'utilities/scripts/mvc-framework/models/images'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import {
  MediaGrid as MediaGridDefaults,
  SelectNavigation as SelectNavigationDefaults,
} from './defaults'
import {
  Settings as SettingsModel,
} from './models'
import View from './view'
import Channels from 'modules/channels'
import {
  SelectNavigation as SelectNavigationController,
  MediaGrid as MediaGridController,
  Loader as LoaderController,
  Error as ErrorController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        settings: new SettingsModel(),
        mediaGrid: new Model({
          defaults: MediaGridDefaults,
        }),
        selectNavigation: new Model({
          defaults: SelectNavigationDefaults,
        }),
        // images: ImagesModel,
      },
      modelEvents: {
        'settings set:loading': 'onSettingsModelSetLoading',
        'images set': 'onImagesModelSet',
        'images get:error': 'onImageSearchModelGetError',
      },
      modelCallbacks: {
        onSettingsModelSetLoading: (event, settingsModel) => this.onSettingsModelSetLoading(event, settingsModel),
        onImagesModelSet: (event, imagesModel) => this.onImagesModelSet(event, imagesModel),
        onImageSearchModelGetError: (event, imageSearchModel) => this.onImageSearchModelGetError(event, imageSearchModel),
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
        loader: new LoaderController(),
        error: new ErrorController(),
      },
      controllerEvents: {
        'error ready': 'onErrorControllerReady',
        'error accept': 'onErrorControllerAccept',
        'selectNavigation select:change': 'onSelectNavigationControllerSelectChange',
        'selectNavigation button:click': 'onSelectNavigationControllerButtonClick',
        'mediaGrid click': 'onMediaGridControllerClick',
      },
      controllerCallbacks: {
        onErrorControllerReady: (event, errorController) => this.onErrorControllerReady(event, errorController),
        onErrorControllerAccept: (event, errorController) => this.onErrorControllerAccept(event, errorController),
        onSelectNavigationControllerSelectChange: (event, navigationController) => this.onSelectNavigationControllerSelectChange(event, navigationController),
        onSelectNavigationControllerButtonClick: (event, navigationController) => this.onSelectNavigationControllerButtonClick(event, navigationController),
        onMediaGridControllerClick: (event, mediaGridController, mediaGridItemController) => this.onMediaGridControllerClick(event, mediaGridController, mediaGridItemController),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
  } }
  onViewHeaderNavButtonClick(event, view) {
    switch(event.data.action) {
      case 'upload':
        Channels.channel('Application').request('router').navigate('/upload')
        break
    }
    return this
  }
  onSettingsModelSetLoading(event, settingsModel) {
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
  onImagesModelSet(event, imagesModel) {
    this.models.settings.set('loading', false)
    this.startControllers()
    return this
  }
  onImageSearchModelGetError(event, imageSearchModel) {
    this.models.settings.set('loading', false)
    this.controllers.error.models.settings.set(event.data)
    return this
  }
  onSelectNavigationControllerSelectChange(event, navigationController) {
    this.models.settings.set('order', event.data.value)
    return this
  }
  onSelectNavigationControllerButtonClick(event, navigationController) {
    switch(event.data.action) {
      case 'next':
        // this.models.settings.advancePage(1)
        break
      case 'previous':
        // this.models.settings.advancePage(-1)
        break
    }
    return this
  }
  onMediaGridControllerClick(event, mediaGridController, mediaGridItemController) {
    Channels.channel('Application').request('router').navigate(
      `/photos/${mediaGridItemController.models.image.get('id')}`
    )
    return this
  }
  onErrorControllerReady(event, errorController) {
    this.views.view.renderElement('main', 'afterbegin', this.controllers.error.views.view.element)
    return this
  }
  onErrorControllerAccept(event, errorController) {
    this.controllers.error.stop()
    Channels.channel('Application').request('router').navigate('/photos')
    return this
  }
  getImagesModel() {
    this.models.settings.set('loading', true)
    this.models.images.services.get.fetch()
    return this
  }
  startImagesModel() {
    this.models.images = new ImagesModel({}, {
      settings: this.models.settings,
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
        ui: this.models.selectNavigation,
      },
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'afterbegin', this.controllers.selectNavigation.views.view.element)
    return this
  }
  startMediaGridController() {
    if(this.controllers.mediaGrid) this.controllers.mediaGrid.stop()
    this.models.mediaGrid.set('images', this.models.images.parse())
    console.log('startMediaGridController')
    this.controllers.mediaGrid = new MediaGridController({
      models: {
        user: this.models.user,
        ui: this.models.mediaGrid,
      },
    }).start()
    console.log(this.controllers.mediaGrid.views.view.element)
    this.resetEvents('controller')
    this.views.view.renderElement('main', 'beforeEnd', this.controllers.mediaGrid.views.view.element)
    return this
  }
  renderView() {
    this.views.view.render()
    return this
  }
  startControllers() {
    return this
      .startSelectNavigationController()
      .startMediaGridController()
  }
  start() {
    console.log('start')
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this
        .renderView()
        .startImagesModel()
    } else {
      Channels.channel('Application').request('router').navigate('/')
    }
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
