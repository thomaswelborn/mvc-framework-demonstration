import { mergeDeep } from 'utilities/scripts'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import { Button as ButtonController } from 'library'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model(options.models.ui),
      },
      views: {
        view: new View(),
      },
      controllerEvents: {
        '[^button-] click': 'onButtonControllerClick',
      },
      controllerCallbacks: {
        onButtonControllerClick: (event, buttonController) => this.onButtonControllerClick(event, buttonController),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    ui: this.models.ui.parse(),
  } }
  onButtonControllerClick(event, buttonController) {
    return this.emit(
      'button:click',
      event.data,
      this,
    )
  }
  getButtonControllerName(index) { return `button-${index}` }
  startButtonControllers() {
    this.controllers = this.options.controllers.buttons.reduce((controllers, button, buttonIndex) => {
      const buttonControllerName = this.getButtonControllerName(buttonIndex)
      controllers[buttonControllerName] = new ButtonController({
        models: {
          user: this.models.user,
        },
      }, button).start()
      this.views.view.renderElement('nav', 'beforeend', controllers[buttonControllerName].views.view.element)
      return controllers
    }, {})
    return this.resetEvents('controller')
  }
  startView() {
    this.views.view.render(this.viewData)
    return this
  }
  start() {
    return this
      .startView()
      .startButtonControllers()
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}