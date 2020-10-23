import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Loader as LoaderController,
  Error as ErrorController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      modelEvents: {
        'ui set:loading': 'onUIModelSetLoading',
      },
      modelCallbacks: {
        onUIModelSetLoading: (event, uiModel) => this.onUIModelSetLoading(event, uiModel),
      },
      controllers: {
        loader: new LoaderController(),
      },
      controllerEvents: {
        'error accept': 'onErrorControllerAccept',
      },
      controllerCallbacks: {
        onErrorControllerAccept: (event, errorController) => this.onErrorControllerAccept(event, errorController),
      },
    }, settings), mergeDeep({}, settings))
  }
  onErrorControllerAccept(event, errorController) {
    this.controllers.error.stop()
    return this
  }
  onUIModelSetLoading(event, uiModel) {
    switch(event.data.value) {
      case true:
        this.controllers.loader.start()
        this.views.view.renderElement('$element', 'afterbegin', this.controllers.loader.views.view.element)
        break
      case false:
        this.controllers.loader.stop()
        break
    }
    return this
  }
  startErrorController(data, acceptCallback) {
    console.log('startErrorController', data)
    this.controllers.error = new ErrorController({}, {
      models: {
        ui: {
          defaults: data,
        },
      },
    }).start()
      .on('accept', acceptCallback)
    this.resetEvents('controller')
    this.views.view.renderElement('$element', 'afterbegin', this.controllers.error.views.view.element)
    return this
  }
}