import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        navigation: Object(),
        image: Object(),
      },
    }, settings), mergeDeep({}, options))
  }
}
