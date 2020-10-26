import { mergeDeep } from 'utilities/scripts'
import { AsyncModel } from 'utilities/scripts/mvc-framework/models'
import { POST } from './services'

export default class extends AsyncModel {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        post: new POST({}, {
          user: options.user,
          ui: options.ui,
          image: options.image,
        }),
      },
      defaults: {
        id: Number(),
        message: String(),
      },
    }, settings), mergeDeep({}, options))
  }
}