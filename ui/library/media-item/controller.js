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
      },
      views: {
        view: new View(options.views.view),
      },
      viewEvents: {
        'view click': 'onViewElementClick',
      },
      viewCallbacks: {
        onViewElementClick: (event, view) => this.onViewElementClick(event, view),
      },
      controllers: {
        image: (options.controllers.image)
          ? new ImageController({
            user: settings.models.user,
          }, options.controllers.image).start()
          : null,
        navigation: (options.controllers.navigation)
          ? new NavigationController({
            models: {
              user: settings.models.user
            },
          }, options.controllers.navigation).start()
          : null
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
    return this.emit(
      'click',
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
  renderImageController() {
    if(this.controllers.image) {
      this.controllers.image.stop()
      this.views.view
        .renderElement(
          '$element', 
          'afterbegin', 
          this.controllers.image.views.view.element
        )
    }
    return this
  }
  renderNavigationController() {
    if(this.controllers.navigation) {
      this.controllers.navigation.stop()
      this.views.view.renderElement(
        '$element', 
        'beforeend', 
        this.controllers.navigation.views.view.element,
      )
    }
    return this
  }
  render() {
    return this
      .renderImageController()
      .renderNavigationController()
  }
  start() {
    return this.render()
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}