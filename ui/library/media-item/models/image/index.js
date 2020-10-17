import { mergeDeep } from 'utilities/scripts'
import { ImageDefaults } from 'utilities/scripts/the-cat-api'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: ImageDefaults,
    }, settings), mergeDeep({}, options))
  }
}
