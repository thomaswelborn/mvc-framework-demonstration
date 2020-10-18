import { mergeDeep } from 'utilities/scripts'
import {
  Controller,
  Model,
} from 'mvc-framework/source/MVC'
import {
  Settings as SettingsModel,
} from './models'
import View from './view'
import NavigationController from '../navigation'
import ImageController from '../image'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        // ui: settings.models.ui,
        settings: new SettingsModel({
          defaults: options.settings,
        }),
        navigation: new Model({
          defaults: settings.models.ui.get('navigation'),
        }),
        image: new Model({
          defaults: settings.models.ui.get('image'),
        }),
      },
      views: {
        view: new View({
          attributes: settings.models.ui.get('attributes'),
        }),
      },
      viewEvents: {
        'view click': 'onViewElementClick',
      },
      viewCallbacks: {
        onViewElementClick: (event, view) => this.onViewElementClick(event, view),
      },
      controllers: {
        // navigation: NavigationController,
      },
      controllerEvents: {
        'navigation click': 'onNavigationControllerClick',
      },
      controllerCallbacks: {
        onNavigationControllerClick: (event, navigationController, navigationView) => this.onNavigationControllerClick(event, navigationController, navigationView),
      },
    }, settings), mergeDeep({}, options))
  }
  onViewElementClick(event, view) {
    this.emit(
      event.name,
      event.data,
      this,
      view,
    )
  }
  onNavigationControllerClick(event, navigationController, navigationView) {
    return this.emit(
      'click:navigation',
      event.data,
      this,
    )
  }
  startImageController() {
    if(this.models.ui.get('image')) {
      if(this.controllers.image) this.controllers.image.stop()
      this.controllers.image = new ImageController({
        models: {
          user: this.models.user,
          ui: this.models.image,
        },
      }, {}).start()
      this.resetEvents('controller')
      console.log(this.controllers.image.views.view.element)
      this.views.view
        .renderElement('$element', 'afterbegin', this.controllers.image.views.view.element)
    }
    return this
  }
  startNavigationController() {
    if(this.models.ui.get('navigation')) {
      if(this.controllers.navigation) this.controllers.navigation.stop()
      this.controllers.navigation = new NavigationController({
        models: {
          user: this.models.user,
          ui: this.models.navigation,
        },
      }).start()
      this.resetEvents('controller')
      this.views.view
        .renderElement('$element', 'beforeend', this.controllers.navigation.views.view.element)
      console.log(this.controllers.navigation.views.view.element)
    }
    return this
  }
  startControllers() {
    return this
      .startImageController()
      .startNavigationController()
  }
  start() {
    return this.startControllers()
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}