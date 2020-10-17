import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import { Image as ImageModel } from './models'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        image: new ImageModel({
          defaults: options.image,
        }),
      },
      views: {
        view: new View(),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    image: this.models.image.parse(),
  } }
  start() {
    this.views.view.render(this.viewData)
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}