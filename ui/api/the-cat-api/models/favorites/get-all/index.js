import { mergeDeep } from 'utilities/scripts'
import { AsyncModel } from 'utilities/scripts/mvc-framework/models'
import { GET } from './services'

export default class extends AsyncModel {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({}, {
          user: options.user,
          ui: options.ui,
        }),
      },
      defaults: {
        details: Object({
          count: Number(),
          total: Number(),
          page: Number(),
        }),
        favorites: Array(),
      },
    }, settings), mergeDeep({}, options))
  }
}