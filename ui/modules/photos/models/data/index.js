import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { GET } from './services'
import { SearchResultsDefaults } from 'library/the-cat-api'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({}, {
          user: options.user,
          settings: options.settings,
        }),
        defaults: SearchResultsDefaults,
      },
      serviceEvents: {
        'get ready': 'onGetServiceReady',
      },
      serviceCallbacks: {
        onGetServiceReady: (event, getService) => this.onGetServiceReady(event, getService),
      },
    }, settings), mergeDeep({}, options))
  }
  get currentImage() { return this.get('images')[0] }
  onGetServiceReady(event, getService) {
    this.set({
      details: {
        count: event.data.length,
        total: Number(this.services.get.response.headers.get('pagination-count')),
        page: Number(this.services.get.response.headers.get('pagination-page')),
      },
      images: event.data,
    })
    return this
  }
}