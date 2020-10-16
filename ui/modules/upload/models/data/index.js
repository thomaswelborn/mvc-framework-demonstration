import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { POST } from './services'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        post: new POST({}, {
          user: options.user,
        }),
      },
      serviceEvents: {
        'post ready': 'onPostReady',
      },
      serviceCallbacks: {
        onPostReady: (event, postService) => this.onPostReady(event, postService),
      },
      defaults: {
        id: String(),
        url: String(),
        height: Number(),
        width: Number(),
      },
    }, settings), mergeDeep({}, options))
  }
  onPostReady(event, postService) {
    this.set({
      id: event.data.id,
      url: event.data.url,
      width: event.data.width,
      height: event.data.height,
    })
    return this
  }
}