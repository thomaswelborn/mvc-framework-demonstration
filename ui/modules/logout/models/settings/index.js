import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      localStorage: {
        sync: true,
        endpoint: '/api/logout/settings',
      },
      defaults: {
        auth: true,
        noAuth: false,
      },
    }, settings), mergeDeep({}, options))
  }
}