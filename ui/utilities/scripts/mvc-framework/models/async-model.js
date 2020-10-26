import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {},
      serviceEvents: {
        '[.*] ready': 'onServiceReady',
        '[.*] error': 'onServiceError',
      },
      serviceCallbacks: {
        onServiceReady: (event, service) => this.onServiceReady(event, service),
        onServiceError: (event, service) => this.onServiceError(event, service),
      },
    }, settings), mergeDeep({}, options))
  }
  onServiceReady(event, service) {
    switch(service.response.status) {
      case 200: 
      case 202: 
      default: 
        this.emit(
          'ready',
          event.data,
          this,
        )
        break
      case 400: 
      case 404: 
        this.emit(
          'error',
          event.data,
          this,
        )
        break
    }
    return this
  }
  onServiceError(event, service) {
    this.emit(
      'error',
      {
        status: -1,
        message: event.data,
      },
      this,
    )
  }
}