import { mergeDeep } from 'utilities/scripts'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import ButtonController from '../button'
import NavigationController from '../navigation'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model(options.models.ui),
      },
      modelEvents: {
        'ui set:toggled': 'onUIModelSetToggled',
      },
      modelCallbacks: {
        onUIModelSetToggled: (event, uiModel) => this.onUIModelSetToggled(event, uiModel),
      },
      views: {
        view: new View(options.views.view),
      },
      controllers: {
        toggleButton: new ButtonController({
          models: {
            user: settings.models.user,
          },
        }, options.controllers.toggle).start(),
        subnavigation: new NavigationController({
          models: {
            user: settings.models.user,
          },
        }, options.controllers.subnavigation).start(),
      },
      controllerEvents: {
        'toggleButton click': 'onToggleButtonControllerClick',
        'subnavigation click': 'onSubnavigationControllerClick',
      },
      controllerCallbacks: {
        onToggleButtonControllerClick: (event, toggleButtonController, toggleButtonView) => this.onToggleButtonControllerClick(event, toggleButtonController, toggleButtonView),
        onSubnavigationControllerClick: (event, subnavigationController) => this.onSubnavigationControllerClick(event, subnavigationController),
      },
    }, settings), mergeDeep({}, options))
  }
  onUIModelSetToggled(event, uiModel) {
    this.views.view.renderElementAttribute('$element', 'data-toggled', event.data.value)
    return this
  }
  onToggleButtonControllerClick(event, toggleButtonController, toggleButtonView) {
    this.models.ui.set('toggled', !this.models.ui.get('toggled'))
  }
  onSubnavigationControllerClick(event, subnavigationController) {
    return this
      .emit(
        event.name,
        event.data,
        this,
        subnavigationController,
      )
  }
  renderToggleButton() {
    this.views.view.renderElement(
      '$element', 
      'afterbegin', 
      this.controllers.toggleButton.views.view.element
    )
    return this
  }
  renderSubnavigation() {
    this.views.view.renderElement(
      '$element', 
      'beforeend', 
      this.controllers.subnavigation.views.view.element,
    )
    return this
  }
  start() {
    return this
      .renderToggleButton()
      .renderSubnavigation()
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}