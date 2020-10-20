import { mergeDeep } from 'utilities/scripts'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model(options.models.ui),
      },
      views: {
        view: new View(options.views.view),
      },
      viewEvents: {
        'view click': 'onViewClick',
      },
      viewCallbacks: {
        onViewClick: (event, view) => this.onViewClick(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    user: this.models.user.parse(),
    ui: this.models.ui.parse(),
  } }
  onViewClick(event, view) {
    if(event.data.href) window.location.hash = event.data.href
    return this
      .emit(
        'click',
        event.data,
        this,
        view,
      )
  }
  renderView() {
    this.views.view.render(this.viewData)
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