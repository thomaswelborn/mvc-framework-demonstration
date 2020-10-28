import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import ButtonController from '../button'
import NavigationController from '../navigation'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: settings.models.user,
        ui: new Model(options.models.ui),
      },
      modelEvents: {
        'ui set:selectedOption': 'onUIModelSetSelectedOption',
      },
      modelCallbacks: {
        onUIModelSetSelectedOption: (event, uiModel) => this.onUIModelSetSelectedOption(event, uiModel),
      },
      views: {
        view: new View(options.views.view),
      },
      viewEvents: {
        'view select:change': 'onViewSelectChange',
        'view subnavigationButton:click': 'onViewSubnavigationButtonClick',
      },
      viewCallbacks: {
        onViewSelectChange: (event, view) => this.onViewSelectChange(event, view),
        onViewSubnavigationButtonClick: (event, view) => this.onViewSubnavigationButtonClick(event, view),
      },
      controllers: {},
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    user: this.models.user.parse(),
    ui: this.models.ui.parse(),
  } }
  onUIModelSetSelectedOption(event, uiModel) {
    return this
      .emit(
        'select:change',
        event.data,
        this,
      )
  }
  onViewSelectChange(event, view) {
    this.models.ui.set('selectedOption', event.data.selected)
    return this
  }
  onViewSubnavigationButtonClick(event, view) {
    return this
      .emit(
        'subnavigationButton:click',
        event.data,
        this,
        view,
      )
  }
  startView() {
    this.views.view
      .render()
      .selectOption(this.models.ui.get('selectedOption'))
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