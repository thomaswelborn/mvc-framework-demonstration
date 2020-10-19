import { mergeDeep } from 'utilities/scripts'
import { Upload as ImageUploadModel } from 'utilities/scripts/mvc-framework/models/images'
import { Settings as SettingsModel } from './models'
import { Controller } from 'mvc-framework/source/MVC'
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
        settings: new SettingsModel(),
        imageUpload: new ImageUploadModel({}, {
          user: settings.models.user,
        }),
      },
      modelEvents: {
        'settings set:imageReady': 'onSettingsModelSetImageReady',
        'settings set:loading': 'onSettingsModelSetLoading',
        'imageUpload set': 'onImageUploadModelSet',
        'imageUpload error': 'onImageUploadModelError',
      },
      modelCallbacks: {
        onSettingsModelSetImageReady: (event, settingsModel) => this.onSettingsModelSetImageReady(event, settingsModel),
        onSettingsModelSetLoading: (event, settingsModel) => this.onSettingsModelSetLoading(event, settingsModel),
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
        loader: new LoaderController(),
        error: new ErrorController(),
      },
      controllerEvents: {
        'error ready': 'onErrorControllerReady',
        'error accept': 'onErrorControllerAccept',
      },
      controllerCallbacks: {
        onErrorControllerReady: (event, errorController) => this.onErrorControllerReady(event, errorController),
        onErrorControllerAccept: (event, errorController) => this.onErrorControllerAccept(event, errorController),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
  } }
  onSettingsModelSetLoading(event, settingsModel) {
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
  onSettingsModelSetImageReady(event, settingsModel) {
    this.models.settings.set('loading', false)
    return this.renderView()
  }
  onImageUploadModelError(event, imageUploadModel) {
    this.models.settings.set('loading', false)
    this.controllers.error.models.settings.set(event.data)
    return this
  }
  onImageUploadModelSet(event, imageUploadModel) {
    Channels.channel('Application').request('router').navigate(`/photos/${event.data.id}`)
    return this
  }
  onErrorControllerReady(event, errorController) {
    console.log(this.controllers.error.views.view.element)
    this.views.view.renderElement('main', 'afterbegin', this.controllers.error.views.view.element)
    return this
  }
  onErrorControllerAccept(event, errorController) {
    this.controllers.error.stop()
    this.models.settings.set('imageReady', false)
    this.views.view.empty('uploadImagePreview')
    return this
  }
  onViewImageInput(event, view) {
    const data = new FormData()
    data.set('file', event.data.file)
    data.set('sub_id', this.models.user.get('subID'))
    this.models.settings.set('imageReady', true)
    this.views.view
      .renderElement('uploadImagePreview', 'afterbegin', event.data.image)
    this.models.imageUpload.services.post.body = data
    return this
  }
  onViewUploadButtonClick(event, view) {
    this.models.settings.set('loading', true)
    this.models.imageUpload.services.post.fetch()
    return this
  }
  renderView() {
    this.views.view.render(this.viewData)
    return this
  }
  start() {
    if(
      (this.models.settings.get('auth') && this.models.user.get('isAuthenticated')) ||
      (this.models.settings.get('noAuth') && !this.models.user.get('isAuthenticated'))
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