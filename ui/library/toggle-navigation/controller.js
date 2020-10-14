import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Button as ButtonController,
  Navigation as NavigationController,
} from 'library'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      views: {
        view: new View({
          attributes: options.data.attributes,
        }),
      },
      controllers: {
        // toggleButton: ToggleButton,
        // subnavigation: Subnavigation,
      },
      controllerEvents: {
        'toggleButton click': 'onToggleButtonControllerClick',
      },
      controllerCallbacks: {
        onToggleButtonControllerClick: (event, toggleButtonController, toggleButtonView) => this.onToggleButtonControllerClick(event, toggleButtonController, toggleButtonView),
      },
    }, settings), mergeDeep({}, options))
  }
  onToggleButtonControllerClick(event, toggleButtonController, toggleButtonView) {
    if(event.data.action === 'toggle-visible') {
      console.log(event.data)
      this.controllers.subnavigation.toggleVisible()
    }
  }
  startToggleButtonController() {
    this.controllers.toggleButton = new ButtonController({
      models: {
        user: this.settings.models.user,
      },
    }, {
      data: this.options.data.toggle,
    }).start()
    this.views.view.renderElement(
      '$element', 
      'afterbegin', 
      this.controllers.toggleButton.views.view.element
    )
    return this
  }
  startSubnavigationController() {
    this.controllers.subnavigation = new NavigationController({
      models: {
        user: this.settings.models.user,
      },
    }, {
      data: this.options.data.subnavigation,
    }).start()
    this.views.view.renderElement(
      '$element', 
      'beforeend', 
      this.controllers.subnavigation.views.view.element
    )
    return this
  }
  start() {
    return this
      .startToggleButtonController()
      .startSubnavigationController()
      .resetEvents('controller')
  }
}