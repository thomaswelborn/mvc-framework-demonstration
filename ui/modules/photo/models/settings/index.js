import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        auth: true,
        noAuth: true,
        redirect: 'account/login',
        id: String(),
        loading: Boolean(),
      },
    }, settings), mergeDeep({}, options))
  }
}