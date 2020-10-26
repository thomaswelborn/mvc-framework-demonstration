import { mergeDeep } from 'utilities/scripts'
import { AsyncModel } from 'utilities/scripts/mvc-framework/models'
import { POST } from './services'

export default class extends AsyncModel {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        post: new POST({}, {
          user: options.user,
        }),
      },
      defaults: {
        id: String(),
        url: String(),
        height: Number(),
        width: Number(),
      },
    }, settings), mergeDeep({}, options))
  }
}