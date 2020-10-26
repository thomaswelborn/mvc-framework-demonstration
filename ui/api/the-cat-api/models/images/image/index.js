import { mergeDeep } from 'utilities/scripts'
import { AsyncModel } from 'utilities/scripts/mvc-framework/models'
import {
  GET,
  DELETE,
} from './services'
import { ImageDefaults } from 'api/the-cat-api/defaults'

export default class extends AsyncModel {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({}, {
          user: options.user,
          ui: options.ui,
        }),
        delete: new DELETE({}, {
          user: options.user,
          ui: options.ui,
        }),
      },
      defaults: ImageDefaults,
    }, settings), mergeDeep({}, options))
  }
}