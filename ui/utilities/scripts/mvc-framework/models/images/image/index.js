import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import {
  GET,
  DELETE,
} from './services'
import { ImageDefaults } from 'utilities/scripts/the-cat-api'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({}, {
          user: options.user,
          ui: options.ui,
        }),
        delete: new DELETE({}, {
          user: options.user,
          ui: options.ui,
        }),
      },
      serviceEvents: {
        'get ready': 'onGetServiceReady',
        'delete error': 'onDeleteServiceReady',
      },
      serviceCallbacks: {
        onGetServiceReady: (event, getService) => this.onGetServiceReady(event, getService),
        onDeleteServiceReady: (event, deleteService) => this.onDeleteServiceReady(event, deleteService),
      },
      defaults: ImageDefaults,
    }, settings), mergeDeep({}, options))
  }
  onGetServiceReady(event, getService) {
    switch(getService.response.status) {
      case 400:
      case 402:
      case 404:
        this.emit(
          'get:error',
          event.data,
          this,
          getService,
        )
        break
      case 200:
        this.set(event.data)
        break
    }
    return this
  }
  onDeleteServiceReady(event, deleteService) {
    switch(deleteService.response.status) {
      case 204:
        this.emit(
          'delete:success',
          event.data,
          this,
          deleteService,
        )
        break
    }
    return this
  }
}