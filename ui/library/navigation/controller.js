import { mergeDeep } from 'utilities/scripts'
import { startButtonControllers } from 'utilities/scripts/mvc-framework/methods'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import View from './view'
import ButtonController from '../button'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: (options.models.ui)
          ? new Model(options.models.ui)
          : null,
      },
      views: {
        view: new View(options.views.view),
      },
      controllers: mergeDeep({}, startButtonControllers(settings, options.controllers.buttons, ButtonController)),
      controllerEvents: {
        '[^button-] click': 'onButtonControllerClick',
      },
      controllerCallbacks: {
        onButtonControllerClick: (event, view) => this.onButtonControllerClick(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  onButtonControllerClick(event, view) {
    return this
      .emit(
        event.name,
        event.data,
        this,
        view
      )
  }
  renderButtonControllers() {
    Object.entries(this.controllers).forEach(([buttonControllerName, buttonController]) => {
      if(
        (buttonController.models.ui.defaults.auth && this.models.user.get('isAuthenticated')) || 
        (buttonController.models.ui.defaults.noAuth && !this.models.user.get('isAuthenticated'))
      ) {
        this.views.view.renderElement(
          '$element', 
          'beforeend',
          buttonController.views.view.element,
        )
      }
    })
    return this
  }
  start() {
    return this.renderButtonControllers()
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
