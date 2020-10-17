import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import Defaults from './index.json'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: Defaults,
    }, settings), mergeDeep({}, options))
  }
}