import { mergeDeep } from 'utilities/scripts'
import { AsyncModel } from 'utilities/scripts/mvc-framework/models'
import { GET } from './services'
import { SearchResultsDefaults } from 'api/the-cat-api/defaults'

export default class extends AsyncModel {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({}, {
          user: options.user,
          ui: options.ui,
        }),
      },
      defaults: SearchResultsDefaults,
    }, settings), mergeDeep({}, options))
  }
}