import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { GET } from './services'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({}, {
          user: options.user,
          ui: options.ui,
        }),
      },
      serviceEvents: {
        'get ready': 'onGetServiceReady',
      },
      serviceCallbacks: {
        onGetServiceReady: (event, getService) => this.onGetServiceReady(event, getService),
      },
      defaults: {
        details: Object({
          count: Number(),
          total: Number(),
          page: Number(),
        }),
        favorites: Array(),
      },
    }, settings), mergeDeep({}, options))
  }
  onGetServiceReady(event, getService) {
    switch(getService.response.status) {
      case 200: 
      default: 
        console.log(event.name, event.data)
        this.set({
          details: {
            count: event.data.length,
            total: Number(this.services.get.response.headers.get('pagination-count')),
            page: Number(this.services.get.response.headers.get('pagination-page')),
          },
          favorites: event.data,
        })
        break
      case 400: 
        this.emit(
          'error',
          event.data,
          this,
        )
        break
      return this
    }
  }
}