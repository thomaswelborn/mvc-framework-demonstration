import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Data as DataModel,
  Library as LibraryModel,
  Settings as SettingsModel,
} from './models'
import View from './view'
import {
  Navigation as NavigationController,
  Image as ImageController,
} from 'library'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        data: new DataModel({
          defaults: options.data,
        }),
        settings: new SettingsModel(),
        library: new LibraryModel({
          defaults: options.library
        })
      },
      views: {
        view: new View(),
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
  onNavigationControllerClick(event, navigationController, navigationView) {
    switch(event.data.action) {
      case 'new':
        this.getDataModel()
        break
    }
    return this
  }
  startImageController() {
    if(this.controllers.image) this.controllers.image.stop()
    this.controllers.image = new ImageController({}, {
      data: this.models.data.parse(),
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
  renderView() {
    this
      .startImageController()
      .startNavigationController()
    return this
  }
  start() {
    return this.renderView()
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}