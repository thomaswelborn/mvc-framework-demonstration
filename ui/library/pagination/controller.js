import { mergeDeep } from 'utilities/scripts'
import { startButtonControllers } from 'utilities/scripts/mvc-framework/methods'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import View from './view'
import ButtonController from '../button'

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
        'view newPage': 'onViewNewPage',
        'view advancePage': 'onViewAdvancePage',
        'view refreshPage': 'onViewRefreshPage',
      },
      viewCallbacks: {
        onViewNewPage: (event, view) => this.onViewNewPage(event, view),
        onViewAdvancePage: (event, view) => this.onViewAdvancePage(event, view),
        onViewRefreshPage: (event, view) => this.onViewRefreshPage(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    ui: this.models.ui.parse(),
  } }
  onViewNewPage(event, view) {
    if(
      event.data.newPage >= 0 || 
      event.data.newPage <= Math.ceil(
        this.models.ui.get('count') / this.models.ui.get('limit')
      )
    ) {
      console.log(event.data)
      this.emit(
        'newPage',
        event.data,
        this,
        view,
      )
    } else {
      this.views.view.ui.paginationPageInput.value = this.models.ui.get('page')
    }
    return this
  }
  onViewAdvancePage(event, view) {
    return this
      .emit(
        'advancePage',
        event.data,
        this,
      )
  }
  onViewRefreshPage(event, view) {
    return this
      .emit(
        'refreshPage',
        event.data,
        this,
      )
  }
  startView() {
    this.views.view.render(this.viewData)
    return this
  }
  start() {
    this.startView()
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}
