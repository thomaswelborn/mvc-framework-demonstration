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
        ui: new Model(options.models.ui),
      },
      views: {
        view: new View(),
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
    ui: this.models.ui.parse(),
  } }
  onViewClick(event, view) {
    if(event.data.href) window.location.hash = event.data.href
    return this
      .emit(
        'accept',
        {},
        this,
        view,
      )
  }
  startView() {
    this.views.view.render(this.viewData)
    return this
  }
  start() {
    return this.startView()
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}