import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import Router from './router'
import {
  Library as LibraryModel,
  User as UserModel,
} from './models'
import View from './view'
import {
  ToggleNavigation as ToggleNavigationController,
} from 'library'

import Modules from 'modules'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      routers: {},
      routerEvents: {
        'application error': 'onApplicationRouterError',
      },
      routerCallbacks: {
        onApplicationRouterError: (event, router) => this.onApplicationRouterError(event, router),
      },
      models: {
        library: new LibraryModel(),
        user: new UserModel(),
      },
      modelEvents: {
        'user set:isAuthenticated': 'onUserModelSetIsAuthenticated',
      },
      modelCallbacks: {
        onUserModelSetIsAuthenticated: (event, userModel) => this.onUserModelSetIsAuthenticated(event, userModel),
      },
      views: {
        view: new View(),
      },
      controllers: {
        // navigation: Navigation,
      },
      controllerEvents: {
        'navigation click': 'onNavigationControllerClick',
      },
      controllerCallbacks: {
        onNavigationControllerClick: (event, navigationController, navigationView) => this.onNavigationControllerClick(event, navigationController, navigationView),
      },
    }, settings), mergeDeep({}, options))
    Channels.channel('Application').response('router', () => this.routers.application)
    Channels.channel('Application').response('models:user', () => this.models.user)
  }
  get currentModule() { return this._currentModule }
  set currentModule(currentModule) { this._currentModule = currentModule }
  onNavigationControllerClick(event, navigationController, navigationView) {
    console.log(event)
    return this
  }
  onUserModelSetIsAuthenticated(event, userModel) {
    console.log('onUserModelSetIsAuthenticated', event)
    if(event.data.value === true) {
      this.routers.application.navigate('/')
    }
    this.startToggleNavigationController()
    return this
  }
  onApplicationRouterError(event, router) {
    return this
  }
  loadModule(route) {
    this.currentModule = new Modules[route.route.name]({
      models: {
        user: this.models.user,
      },
    }, {})
    this.currentModule.start()
    if(
      this.currentModule.views &&
      this.currentModule.views.view &&
      this.currentModule.views.view.element
    ) {
      this.views.view
        .empty('main')
        .renderElement(
          'main',
          'afterbegin',
          this.currentModule.views.view.element,
        )
    }
    return this
  }
  startView() {
    this.views.view
      .render()
      .autoInsert()
    return this
  }
  startRouter() {
    this.routers.application = new Router({
      controller: this,
    })
    this.resetEvents('router')
    this.routers.application.start()
    return this
  }
  startToggleNavigationController() {
    if(this.controllers.toggleNavigation) this.controllers.toggleNavigation.views.view.autoRemove()
    this.controllers.toggleNavigation = new ToggleNavigationController({
      models: {
        user: this.models.user,
      },
    }, {
      data: this.models.library.get('header').toggleNavigation,
    }).start()
    this.views.view.renderElement(
      'header',
      'beforeend',
      this.controllers.toggleNavigation.views.view.element,
    )
    return this
  }
  startControllers() {
    this.startToggleNavigationController()
    return this
  }
  start() {
    this
      .startView()
      .startControllers()
      .startRouter()
    return this
  }
}