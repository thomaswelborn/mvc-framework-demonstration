import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import {
  GET,
  DELETE,
} from './services'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({}, {
          user: options.user,
          ui: options.ui,
          route: options.route,
        }),
        delete: new DELETE({}, {
          user: options.user,
          ui: options.ui,
          route: options.route,
        }),
      },
      serviceEvents: {
        'get ready': 'onGetServiceReady',
        'delete ready': 'onDeleteServiceReady',
      },
      serviceCallbacks: {
        onGetServiceReady: (event, getService) => this.onGetServiceReady(event, getService),
        onDeleteServiceReady: (event, deleteService) => this.onDeleteServiceReady(event, deleteService),
      },
    }, settings), mergeDeep({}, options))
    console.log(options.route)
  }
  onGetServiceReady(event, getService) {
    switch(getService.response.status) {
      case 200: 
      default: 
        this.set(event.data)
        break
      case 400: 
        this.emit(
          'error',
          event.data,
          this,
        )
        break
    }
    return this
  }
  onDeleteServiceReady(event, deleteService) {
    switch(deleteService.response.status) {
      case 200:
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