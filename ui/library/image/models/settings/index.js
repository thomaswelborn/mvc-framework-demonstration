import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {
    defaults: {
      id: String(),
      url: String(),
      width: Number(),
      height: Number(),
      breeds: Array(),
      categories: Array(),
    },
  }, options = {}) {
    super(mergeDeep({}, settings), mergeDeep({}, options))
  }
}