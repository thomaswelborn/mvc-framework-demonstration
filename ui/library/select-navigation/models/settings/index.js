import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        selected: 'RANDOM',
        attributes: Object(),
        select: Array(),
        buttons: Array(),
      },
    }, settings), mergeDeep({}, options))
  }
}