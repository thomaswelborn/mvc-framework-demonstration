import { mergeDeep } from 'utilities/scripts'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import { MediaItem as MediaItemDefaults } from './defaults'
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
        // ui: settings.models.ui,
        settings: new SettingsModel(),
        images: new Model({
          defaults: settings.models.ui.get('images'),
        }),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // `media-item-${index}`: MediaItemController,
      },
      controllerEvents: {
        '[^media-item-] click': 'onMediaItemControllerClick',
      },
      controllerCallbacks: {
        onMediaItemControllerClick: (event, mediaItemController) => this.onMediaItemControllerClick(event, mediaItemController),
      },
    }, settings), mergeDeep({}, options))
    console.log(this.models)
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
          ui: new Model({
            defaults: mergeDeep({
              image: image,
            }, MediaItemDefaults),
          })
        },
      }).start()
      this.resetEvents('controller')
      this.views.view.renderElement('$element', 'beforeend', this.controllers[mediaItemName].views.view.element)
    })
    console.log('startMediaItemControllers')
    return this
  }
  startControllers() {
    return this.startMediaItemControllers()
  }
  start() {
    console.log('start')
    this.startControllers()
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
