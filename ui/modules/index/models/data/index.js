import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { GET } from './services'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({
          headers: {
            'x-api-key': options.user.get('apiKey'),
          },
          parameters: {
            'order': options.settings.get('order'),
            'page': options.settings.get('page'),
          },
        }),
        defaults: {
          details: {
            count: Number(),
            total: Number(),
            page: Number(),
          },
          images: Array(Object({
            id: String(),
            url: String(),
            categories: Array(Object({
              id: Number(),
              name: String(),
            })),
            breeds: Array(Object({})),
          })),
        },
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