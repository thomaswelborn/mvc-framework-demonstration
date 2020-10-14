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
        isAuthenticated: Boolean(),
        subID: String(),
        apiKey: String('f71d7df0-dbea-4538-8c74-7617cbd19172'),
      },
    }, settings), options)
  }
}