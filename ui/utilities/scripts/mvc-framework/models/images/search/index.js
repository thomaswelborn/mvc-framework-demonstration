import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { GET } from './services'
import { SearchResultsDefaults } from 'utilities/scripts/the-cat-api'

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
      defaults: SearchResultsDefaults,
    }, settings), mergeDeep({}, options))
  }
  get currentImage() { return this.get('images')[0] }
  onGetServiceReady(event, getService) {
    switch(getService.response.status) {
      case 200: 
      default: 
        this.set({
          details: {
            count: event.data.length,
            total: Number(this.services.get.response.headers.get('pagination-count')),
            page: Number(this.services.get.response.headers.get('pagination-page')),
          },
          images: event.data,
        })
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
}