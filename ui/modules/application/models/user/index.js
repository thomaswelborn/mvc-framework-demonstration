import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      localStorage: {
        sync: true,
        endpoint: '/api/application/user',
      },
      defaults: {
        sub_id: String(),
        api_key: String(),
      },
    }, settings), options)
  }
}