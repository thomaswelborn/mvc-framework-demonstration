import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        auth: true,
        noAuth: false,
        redirect: '/account/login',
        imageReady: false,
      },
    }, settings), mergeDeep({}, options))
  }
}