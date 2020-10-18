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
  Library as LibraryModel,
} from './models'
import View from './view'
import Channels from 'modules/channels'
import {
  SelectNavigation as SelectNavigationController,
  MediaGrid as MediaGridController,
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
        'images set': 'onImagesModelSet',
      },
      modelCallbacks: {
        onImagesModelSet: (event, imagesModel) => this.onImagesModelSet(event, imagesModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // selectNavigation: SelectNavigation,
        // mediaGrid: MediaGrid,
      },
      controllerEvents: {
        'selectNavigation select:change': 'onSelectNavigationControllerSelectChange',
        'selectNavigation button:click': 'onSelectNavigationControllerButtonClick',
        'mediaGrid click': 'onMediaGridClick',
      },
      controllerCallbacks: {
        onSelectNavigationControllerSelectChange: (event, navigationController) => this.onSelectNavigationControllerSelectChange(event, navigationController),
        onSelectNavigationControllerButtonClick: (event, navigationController) => this.onSelectNavigationControllerButtonClick(event, navigationController),
        onMediaGridClick: (event, mediaGridController, mediaGridItemController) => this.onMediaGridClick(event, mediaGridController, mediaGridItemController),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
  } }
  onImagesModelSet(event, imagesModel) {
    this.startControllers()
    return this
  }
  onSelectNavigationControllerSelectChange(event, navigationController) {
    this.models.settings.set('order', event.data.value)
    return this
  }
  onSelectNavigationControllerButtonClick(event, navigationController) {
    switch(event.data.action) {
      case 'next':
        this.models.settings.advancePage(1)
        break
      case 'previous':
        this.models.settings.advancePage(-1)
        break
    }
    return this
  }
  onMediaGridClick(event, mediaGridController, mediaGridItemController) {
    Channels.channel('Application').request('router').navigate(
      `/photos/${mediaGridItemController.models.image.get('id')}`
    )
    return this
  }
  getImagesModel() {
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
