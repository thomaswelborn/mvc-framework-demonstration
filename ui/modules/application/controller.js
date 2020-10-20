import { mergeDeep } from 'utilities/scripts'
import {
  Model,
  Controller,
  Router,
} from 'mvc-framework/source/MVC'
import Channels from 'modules/channels'
import {
  Routes as RoutesDefaults,
  ToggleNavigation as ToggleNavigationDefaults,
} from './defaults'
import {
  User as UserModel,
} from './models'
import View from './view'
import {
  ToggleNavigation as ToggleNavigationController,
} from 'library'

import Modules from 'modules'

const startToggleNavigationController = (settings, options) => {
  return new ToggleNavigationController({
    models: {
      user: settings.models.user,
    },
  }, ToggleNavigationDefaults).start()
}

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      routers: {},
      routerEvents: {
        'application error': 'onApplicationRouterError',
        'application change': 'onApplicationRouterChange',
      },
      routerCallbacks: {
        onApplicationRouterError: (event, router) => this.onApplicationRouterError(event, router),
        onApplicationRouterChange: (event, router) => this.onApplicationRouterChange(event, router),
      },
      models: {
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
      viewEvents: {
        'view headlineAnchor:click': 'onViewHeadlineAnchorClick',
      },
      viewCallbacks: {
        onViewHeadlineAnchorClick: (event, view) => this.onViewHeadlineAnchorClick(event, view),
      },
      controllers: {
        // toggleNavigation: ToggleNavigationController,
      },
      controllerEvents: {
        'toggleNavigation click': 'onNavigationControllerClick',
      },
      controllerCallbacks: {
        onNavigationControllerClick: (event, toggleNavigationController, toggleNavigationView) => this.onNavigationControllerClick(event, toggleNavigationController, toggleNavigationView),
      },
    }, settings), mergeDeep({}, options))
    Channels.channel('Application').response('router', () => this.routers.application)
    Channels.channel('Application').response('models:user', () => this.models.user)
  }
  get currentModule() { return this._currentModule }
  set currentModule(currentModule) { this._currentModule = currentModule }
  onUserModelSetIsAuthenticated(event, userModel) {
    this.startToggleNavigationController()
    return this
  }
  onNavigationControllerClick(event, toggleNavigationController, toggleNavigationView) {
    this.controllers.toggleNavigation.controllers.toggleButton.views.view.element
      .dispatchEvent(new MouseEvent('click'))
    return this
  }
  onViewHeadlineAnchorClick(event, view) {
    this.routers.application.navigate(event.data.href)
    return this
  }
  onApplicationRouterError(event, router) {
    return this
  }
  onApplicationRouterChange(event, router) {
    return this
  }
  loadModule(route) {
    if(this.currentModule) this.currentModule.stop()
    this.currentModule = new Modules[route.route.name]({
      models: {
        user: this.models.user,
      },
    }, {
      route: route,
    })
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
  renderToggleNavigation() {
    this.views.view.renderElement(
      'header',
      'beforeend',
      this.controllers.toggleNavigation.views.view.element,
    )
    return this
  }
  renderView() {
    this.views.view
      .autoRemove()
      .render()
      .autoInsert()
    return this
  }
  startRouter() {
    this.routers.application = new Router({
      hashRouting: true,
      routes: RoutesDefaults,
      controller: this,
    })
    this.resetEvents('router')
    const currentRoute = (window.location.hash.length)
      ? window.location.hash
      : '/'
    this.routers.application
      .navigate('')
      .navigate(currentRoute)
    return this
  }
  startToggleNavigationController() {
    if(this.controllers.toggleNavigation) this.controllers.toggleNavigation.stop()
    this.controllers.toggleNavigation = startToggleNavigationController(this.settings, this.options)
    return this
      .resetEvents('controller')
      .renderToggleNavigation()
  }
  start() {
    this
      .renderView()
      .startToggleNavigationController()
      .startRouter()
    return this
  }
}