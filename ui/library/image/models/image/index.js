import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import {
  ImageDefaults,
} from 'utilities/scripts/the-cat-api'

export default class extends Model {
  constructor(settings = {
    defaults: ImageDefaults,
  }, options = {}) {
    super(mergeDeep({}, settings), mergeDeep({}, options))
  }
}