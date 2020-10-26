import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Loader as LoaderController,
  Error as ErrorController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
      },
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
        'error button:click': 'onErrorControllerButtonClick',
      },
      controllerCallbacks: {
        onErrorControllerButtonClick: (event, errorController) => this.onErrorControllerButtonClick(event, errorController), 
      },
    }, settings), mergeDeep({}, options))
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
    this.controllers.error = new ErrorController({
      models: {
        user: this.models.user,
      },
    }, mergeDeep({
      models: {
        ui: {
          defaults: data,
        },
      },
    }, this.options.controllers.error)).start()
      .on('accept', acceptCallback)
    this.resetEvents('controller')
    this.views.view.renderElement('$element', 'afterbegin', this.controllers.error.views.view.element)
    return this
  }
}