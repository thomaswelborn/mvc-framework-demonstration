import { mergeDeep } from 'utilities/scripts'
import { View } from 'mvc-framework/source/MVC'

export default class extends View {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({}, settings), mergeDeep({}, options))
  }
}