import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import { Settings as SettingsModel } from './models'
import View from './view'
import Channels from 'modules/channels'

import MediaItemController from '../media-item'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        // images: settings.models.images,
        settings: new SettingsModel({
          defaults: options.library,
        }),
      },
      modelEvents: {
        'data set': 'onDataModelSet',
      },
      modelCallbacks: {
        onDataModelSet: (event, dataModel) => this.onDataModelSet(event, dataModel),
      },
      views: {
        view: new View(),
      },
      controllers: {},
      controllerEvents: {
        '[^media-item-] click': 'onMediaItemControllerClick',
      },
      controllerCallbacks: {
        onMediaItemControllerClick: (event, mediaItemController) => this.onMediaItemControllerClick(event, mediaItemController),
      },
    }, settings), mergeDeep({}, options))
  }
  get mediaItemControllerNamePrefix() { return 'media-item-' }
  mediaItemControllerName(index) { return `${this.mediaItemControllerNamePrefix}${index}`}
  onMediaItemControllerClick(event, mediaItemController) {
    return this
      .emit(
        event.name,
        {},
        this,
        mediaItemController,
      )
  }
  onDataModelSet(event, dataModel) {
    return this.startMediaItemControllers()
  }
  stopMediaItemControllers() {
     Object.values(this.controllers).forEach((controller) => controller.stop())
     this.controllers = {}
    return this
  }
  startMediaItemControllers() {
    this.stopMediaItemControllers()
    this.views.view.empty('$element')
    this.models.images.get('images').forEach((image, index) => {
      const mediaItemName = this.mediaItemControllerName(index)
      this.controllers[mediaItemName] = new MediaItemController({
        models: {
          user: this.models.user,
        },
      }, {
        image: image,
      }).start()
      this.resetEvents('controller')
      this.views.view.renderElement('$element', 'beforeend', this.controllers[mediaItemName].views.view.element)
    })
    return this
  }
  startControllers() {
    return this.startMediaItemControllers()
  }
  start() {
    this.startControllers()
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
