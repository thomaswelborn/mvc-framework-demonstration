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
  startView() {
    this.views.view.render(this.viewData)
    return this
  }
  start() {
    return this
      .startView()
  }
}
