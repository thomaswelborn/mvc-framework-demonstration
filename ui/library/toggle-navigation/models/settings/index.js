import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        order: 'RANDOM',
        page: 0,
      },
    }, settings), mergeDeep({}, options))
  }
}