import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      views: {
        view: new View(),
      },
    }, settings), mergeDeep({}, options))
  }
  start() {
    this.views.view.render()
    return this
  }
}