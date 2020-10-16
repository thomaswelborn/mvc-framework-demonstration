import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Settings as SettingsModel,
  Data as DataModel,
} from './models'
import View from './view'

import {
  MediaItem as MediaItemController
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        // data: settings.models.data,
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
    }, settings), mergeDeep({}, options))
  }
  get mediaItemControllerNamePrefix() { return 'media-item-' }
  mediaItemControllerName(index) { return `${this.mediaItemControllerNamePrefix}${index}`}
  onDataModelSet(event, dataModel) {
    console.log(event.name, event.data)
    return this.startMediaItemControllers()
  }
  stopMediaItemControllers() {
     Object.values(this.controllers).forEach((controller) => controller.stop())
     this.controllers = {}
    return this
  }
  startMediaItemControllers() {
    console.log('startMediaItemControllers')
    this.stopMediaItemControllers()
    this.views.view.empty('$element')
    this.models.data.get('images').forEach((image, index) => {
      const mediaItemName = this.mediaItemControllerName(index)
      this.controllers[mediaItemName] = new MediaItemController({
        models: {
          user: this.models.user,
        },
      }, {
        data: image,
      }).start()
      this.resetEvents('controller')
      this.views.view.renderElement('$element', 'beforeend', this.controllers[mediaItemName].views.view.element)
    })
    return this
  }
  start() {
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
