import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Library as LibraryModel,
  Settings as SettingsModel,
  Image as ImageModel,
} from './models'
import View from './view'
import NavigationController from '../navigation'
import ImageController from '../image'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        settings: new SettingsModel({
          defaults: options.settings,
        }),
        library: new LibraryModel({
          defaults: options.library,
        }),
        image: new ImageModel({
          defaults: options.image,
        })
      },
      views: {
        view: new View(),
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
    if(this.controllers.image) this.controllers.image.stop()
    this.controllers.image = new ImageController({}, {
      image: this.models.image.parse(),
    }).start()
    this.resetEvents('controller')
    this.views.view
      .renderElement('$element', 'afterbegin', this.controllers.image.views.view.element)
    return this
  }
  startNavigationController() {
    if(this.models.library.get('navigation')) {
      if(this.controllers.navigation) this.controllers.navigation.stop()
      this.controllers.navigation = new NavigationController({
        models: {
          user: this.models.user,
        },
      }, {
        library: this.models.library.get('navigation'),
      }).start()
      this.resetEvents('controller')
      this.views.view
        .renderElement('$element', 'beforeend', this.controllers.navigation.views.view.element)
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