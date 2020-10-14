import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'

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
      models: {
        library: new LibraryModel(),
        user: new UserModel(),
      },
      views: {
        view: new View(),
      },
      controllers: {
        toggleNavigation: new ToggleNavigationController().start(),
      },
    }, settings), mergeDeep({}, options))
  }
  loadModule(route) {
    console.log('route', route)
    console.log('Modules', Modules)
    console.log('Modules[route.route.name]', Modules[route.route.name]  )
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
  start() {
    this.startRouter()
    return this
  }
}