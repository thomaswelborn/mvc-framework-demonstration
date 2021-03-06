import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({}, settings), mergeDeep({}, options))
    this.set('infoSelected', false)
  }
}