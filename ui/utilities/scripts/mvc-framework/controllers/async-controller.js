import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Loader as LoaderController,
  Error as ErrorController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      modelsEvents: {
        'ui loading': 'onUIModelLoading',
      },
      modelCallbacks: {
        onUIModelLoading: (event, uiModel) => this.onUIModelLoading(event, uiModel),
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
    Channels.channel('Application').request('router').navigate('/favorites')
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
  startErrorController(data) {
    this.controllers.error = new ErrorController({}, {
      models: {
        ui: {
          defaults: data,
        },
      },
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('$element', 'afterbegin', this.controllers.error.views.view.element)
    return this
  }
}