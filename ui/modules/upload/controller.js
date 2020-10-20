import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import {
  Model,
  Controller,
} from 'mvc-framework/source/MVC'
import { Options as OptionsDefaults } from './defaults'
import { Upload as ImageUploadModel } from 'utilities/scripts/mvc-framework/models/images'
import View from './view'
import {
  Loader as LoaderController,
  Error as ErrorController,
} from 'library'
import Channels from 'modules/channels'

export default class extends Controller {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        ui: new Model(OptionsDefaults.models.ui),
        imageUpload: new ImageUploadModel({}, {
          user: settings.models.user,
        }),
      },
      modelEvents: {
        'ui set:imageReady': 'onUIModelSetImageReady',
        'ui set:loading': 'onUIModelSetLoading',
        'imageUpload set': 'onImageUploadModelSet',
        'imageUpload error': 'onImageUploadModelError',
      },
      modelCallbacks: {
        onUIModelSetImageReady: (event, settingsModel) => this.onUIModelSetImageReady(event, settingsModel),
        onUIModelSetLoading: (event, settingsModel) => this.onUIModelSetLoading(event, settingsModel),
        onImageUploadModelSet: (event, imageUploadModel) => this.onImageUploadModelSet(event, imageUploadModel),
        onImageUploadModelError: (event, imageUploadModel) => this.onImageUploadModelError(event, imageUploadModel),
      },
      views: {
        view: new View(),
      },
      viewEvents: {
        'view image:input': 'onViewImageInput',
        'view uploadButton:click': 'onViewUploadButtonClick',
      },
      viewCallbacks: {
        onViewImageInput: (event, view) => this.onViewImageInput(event, view),
        onViewUploadButtonClick: (event, view) => this.onViewUploadButtonClick(event, view),
      },
      controllers: {
        // error: ErrorController,
        loader: new LoaderController(),
      },
      controllerEvents: {
        'error accept': 'onErrorControllerAccept',
      },
      controllerCallbacks: {
        onErrorControllerAccept: (event, errorController) => this.onErrorControllerAccept(event, errorController),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    ui: this.models.ui.parse(),
  } }
  onUIModelSetLoading(event, settingsModel) {
    switch(event.data.value) {
      case true:
        this.controllers.loader.start()
        this.views.view.renderElement('$element', 'afterbegin', this.controllers.loader.views.view.element)
        break
      case false:
        this.controllers.loader.stop()
        break
    }
    return this
  }
  onUIModelSetImageReady(event, settingsModel) {
    this.models.ui.set('loading', false)
    return this.renderView()
  }
  onImageUploadModelError(event, imageUploadModel) {
    this.models.ui.set('loading', false)
    return this.startErrorController(event)
  }
  onImageUploadModelSet(event, imageUploadModel) {
    Channels.channel('Application').request('router').navigate(`/photos/${event.data.id}`)
    return this
  }
  onErrorControllerAccept(event, errorController) {
    this.controllers.error.stop()
    this.models.ui.set('imageReady', false)
    return this
  }
  onViewImageInput(event, view) {
    const data = new FormData()
    data.set('file', event.data.file)
    data.set('sub_id', this.models.user.get('subID'))
    this.models.ui.set('imageReady', true)
    this.views.view
      .renderElement('uploadImagePreview', 'afterbegin', event.data.image)
    this.models.imageUpload.services.post.body = data
    return this
  }
  onViewUploadButtonClick(event, view) {
    this.models.ui.set('loading', true)
    this.models.imageUpload.services.post.fetch()
    return this
  }
  renderView() {
    this.views.view.render(this.viewData)
    return this
  }
  startErrorController(event) {
    if(this.controllers.error) this.controllers.error.stop()
    this.controllers.error = new ErrorController({}, {
      models: {
        ui: {
          defaults: event.data,
        }
      }
    }).start()
    this.resetEvents('controller')
    this.views.view.renderElement('$element', 'afterbegin', this.controllers.error.views.view.element)
    return this
  }
  start() {
    if(
      (this.models.ui.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.ui.get('noAuth') && !this.models.user.get('isAuthenticated'))
    ) {
      this.renderView()
    } else {
      Channels.channel('Application').request('router').navigate('/')
    }
    return this
  }
  stop() {
    this.views.view.autoRemove()
    return this
  }
}