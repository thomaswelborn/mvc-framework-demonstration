import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import { Settings as SettingsModel } from './models'
import ButtonController from '../button'
import View from './view'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        // user: User,
        // ui: settings.models.ui,
        settings: new SettingsModel({
          localStorage: settings.models.ui.get('localStorage'),
        }),
      },
      modelEvents: {
        'settings set:selected': 'onSettingsModelSetSelected',
      },
      modelCallbacks: {
        onSettingsModelSetSelected: (event, settingsModel) => this.onSettingsModelSetSelected(event, settingsModel),
      },
      views: {
        view: new View({
          attributes: settings.models.ui.get('attributes'),
        }),
      },
      viewEvents: {
        'view select:change': 'onViewSelectChange',
        'view button:click': 'onViewNavButtonClick',
      },
      viewCallbacks: {
        onViewSelectChange: (event, view) => this.onViewSelectChange(event, view),
        onViewNavButtonClick: (event, view) => this.onViewNavButtonClick(event, view),
      },
      controllers: {
        // toggleButton: ToggleButton,
        // subnavigation: Subnavigation,
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
    user: this.models.user.parse(),
    ui: this.models.ui.parse(),
  } }
  onSettingsModelSetSelected(event, settingsModel) {
    return this
      .renderView()
      .emit(
        'select:change',
        event.data,
        this,
      )
  }
  onViewSelectChange(event, view) {
    this.models.settings.set('selected', event.data.selected)
    return this
  }
  onViewNavButtonClick(event, view) {
    return this
      .emit(
        'button:click',
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