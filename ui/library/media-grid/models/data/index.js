import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { SearchResultsDefaults } from 'library/the-cat-api'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: SearchResultsDefaults,
    }, settings), mergeDeep({}, options))
  }
}
