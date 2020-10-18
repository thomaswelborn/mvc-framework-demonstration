import { mergeDeep } from 'utilities/scripts'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import {
  Settings as SettingsModel,
} from './models'
import ButtonController from '../button'
import NavigationController from '../navigation'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        // ui: settings.models.ui,
        toggle: new Model({
          defaults: settings.models.ui.get('toggle'),
        }),
        subnavigation: new Model({
          defaults: settings.models.ui.get('subnavigation'),
        }),
        settings: new SettingsModel(),
      },
      modelEvents: {},
      modelCallbacks: {},
      views: {
        view: new View({
          attributes: settings.models.ui.get('attributes'),
        }),
      },
      controllers: {
        // toggleButton: ButtonController,
        // subnavigation: NavigationController,
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
  onToggleButtonControllerClick(event, toggleButtonController, toggleButtonView) {
    if(event.data.action === 'toggle-visible') {
      this.controllers.subnavigation.models.settings.set(
        'visible', 
        !this.controllers.subnavigation.models.settings.get('visible')
      )
    }
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
  startToggleButtonController() {
    this.controllers.toggleButton = new ButtonController({
      models: {
        user: this.settings.models.user,
      },
    }, {
      data: this.models.toggle.parse(),
    }).start()
    this.views.view.renderElement(
      '$element', 
      'afterbegin', 
      this.controllers.toggleButton.views.view.element
    )
    this.resetEvents('controller')
    return this
  }
  startSubnavigationController() {
    this.controllers.subnavigation = new NavigationController({
      models: {
        user: this.settings.models.user,
        ui: this.models.subnavigation,
      },
    }, {
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement(
      '$element', 
      'beforeend', 
      this.controllers.subnavigation.views.view.element,
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