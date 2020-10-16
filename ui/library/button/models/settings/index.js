import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        active: Boolean(),
        textContent: String(),
        attributes: Object(),
      },
    }, settings), mergeDeep({}, options))
  }
}
