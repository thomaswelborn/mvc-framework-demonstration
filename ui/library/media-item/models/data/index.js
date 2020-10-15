import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        id: String(),
        url: String(),
        categories: Array(Object({
          id: Number(),
          name: String(),
        })),
        breeds: Array(Object({})),
      },
    }, settings), mergeDeep({}, options))
  }
}