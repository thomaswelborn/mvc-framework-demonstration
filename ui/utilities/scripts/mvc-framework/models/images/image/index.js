import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { GET } from './services'
import { ImageDefaults } from 'utilities/scripts/the-cat-api'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({}, {
          user: options.user,
          settings: options.settings,
        }),
      },
      serviceEvents: {
        'get ready': 'onGetServiceReady',
      },
      serviceCallbacks: {
        onGetServiceReady: (event, getService) => this.onGetServiceReady(event, getService),
      },
      defaults: ImageDefaults,
    }, settings), mergeDeep({}, options))
  }
  onGetServiceReady(event, getService) {
    this.set(event.data)
    return this
  }
}