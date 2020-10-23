import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { POST } from './services'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        post: new POST({}, {
          user: options.user,
          ui: options.ui,
          image: options.image,
        }),
      },
      serviceEvents: {
        'post ready': 'onPostReady',
      },
      serviceCallbacks: {
        onPostReady: (event, postService) => this.onPostReady(event, postService),
      },
      defaults: {
        id: Number(),
        message: String(),
      },
    }, settings), mergeDeep({}, options))
  }
  onPostReady(event, postService) {
    switch(postService.response.status) {
      case 200: 
        console.log(postService.response.status)
        console.log(event.name, event.data)
        this.set({
          id: event.data.id,
          message: event.data.message,
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