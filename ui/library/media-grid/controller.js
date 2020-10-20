import { mergeDeep } from 'utilities/scripts'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import { MediaItem as MediaItemDefaults } from './defaults'
import View from './view'
import Channels from 'modules/channels'
import MediaItemController from '../media-item'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        // images: settings.models.images,
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
  stopMediaItemControllers() {
     this.controllers = Object.entries(this.controllers).reduce((controllers, [controllerName, controller]) => {
       if(controllerName.match(new RegExp(`/${this.mediaItemControllerNamePrefix}/`))) {
         controller.stop()
       } else {
         controllers[controllerName] = controller
       }
       return controllers
     }, {})
    return this
  }
  startMediaItemControllers() {
    this.stopMediaItemControllers()
    this.models.images.get('images').forEach((image, index) => {
      const mediaItemName = `${this.mediaItemControllerNamePrefix}-${index}`
      this.controllers[mediaItemName] = new MediaItemController({
        models: {
          user: this.models.user,
        }
      }, mergeDeep(MediaItemDefaults, {
        controllers: {
          image: {
            models: {
              ui: {
                defaults: image,
              }
            },
          },
        }
      })).start()
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
