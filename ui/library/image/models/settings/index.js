import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import {
  BreedDefaults,
  CategoryDefaults,
} from 'library/the-cat-api'

export default class extends Model {
  constructor(settings = {
    defaults: {
      id: String(),
      url: String(),
      width: Number(),
      height: Number(),
      breeds: Array(BreedDefaults),
      categories: Array(CategoryDefaults),
    },
  }, options = {}) {
    super(mergeDeep({}, settings), mergeDeep({}, options))
  }
}