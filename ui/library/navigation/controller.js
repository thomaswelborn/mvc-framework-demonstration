import { mergeDeep } from 'utilities/scripts'
import { Controller } from 'mvc-framework/source/MVC'
import {
  Settings as SettingsModel,
} from './models'
import View from './view'
import ButtonController from 'library/button'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        settings: new SettingsModel(),
      },
      modelEvents: {
        'settings set:visible': 'onSettingsModelSetVisible',
      },
      modelCallbacks: {
        onSettingsModelSetVisible: (event, settingsModel) => this.onSettingsModelSetVisible(event, settingsModel),
      },
      views: {
        view: new View({
          attributes: options.data.attributes,
        }),
      },
      controllers: {},
    }, settings), mergeDeep({}, options))
  }
  onSettingsModelSetVisible(event, settingsModel) {
    console.log(event)
    this.views.view.renderElementAttribute('$element', 'data-visible', event.data.value)
    return this
  }
  toggleVisible() {
    this.models.settings.set('visible', !this.models.settings.get('visible'))
    return this
  }
  startButtonControllers() {
    Array.from(this.options.data.buttons).forEach((buttonOptions, buttonIndex) => {
      const buttonControllerName = `button-${buttonIndex}`
      if(
        (buttonOptions.auth && this.models.user.get('isAuthenticated')) || 
        (buttonOptions.noAuth && !this.models.user.get('isAuthenticated'))
      ) {
        this.controllers[buttonControllerName] = new ButtonController({
          models: {
            user: this.settings.models.user,
          },
        }, {
          data: buttonOptions,
        })
        this.controllers[buttonControllerName].start()
        this.views.view.renderElement(
          '$element', 
          'beforeend',
          this.controllers[buttonControllerName].views.view.element,
        )
      }
    })
    return this
  }
  start() {
    return this
      .startButtonControllers()
  }
}
