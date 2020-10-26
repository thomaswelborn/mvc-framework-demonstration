import { mergeDeep } from 'utilities/scripts'
import { AsyncModel } from 'utilities/scripts/mvc-framework/models'
import { DELETE } from './services'

export default class extends AsyncModel {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        delete: new DELETE({}, {
          user: options.user,
          ui: options.ui,
          route: options.route,
        }),
      },
    }, settings), mergeDeep({}, options))
  }
}