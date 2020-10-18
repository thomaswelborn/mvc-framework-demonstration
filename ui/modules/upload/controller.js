import { mergeDeep } from 'utilities/scripts'
import { Upload as ImageUploadModel } from 'utilities/scripts/mvc-framework/models/images'
import { Settings as SettingsModel } from './models'
import { Controller } from 'mvc-framework/source/MVC'
import View from './view'
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
        'imageUpload set': 'onImageUploadModelSet',
        'imageUpload error': 'onImageUploadModelError',
      },
      modelCallbacks: {
        onSettingsModelSetImageReady: (event, settingsModel) => this.onSettingsModelSetImageReady(event, settingsModel),
        onImageUploadModelSet: (event, imageUploadModel) => this.onImageUploadModelSet(event, imageUploadModel),
        onImageUploadModelError: (event, imageUploadModel) => this.onImageUploadModelError(event, imageUploadModel),
      },
      views: {
        view: new View(),
      },
      viewEvents: {
        'view input': 'onViewInput',
        'view click': 'onViewClick',
      },
      viewCallbacks: {
        onViewInput: (event, view) => this.onViewInput(event, view),
        onViewClick: (event, view) => this.onViewClick(event, view),
      },
    }, settings), mergeDeep({}, options))
  }
  get viewData() { return {
    settings: this.models.settings.parse(),
  } }
  onSettingsModelSetImageReady(event, settingsModel) {
    return this.renderView()
  }
  onImageUploadModelError(event, imageUploadModel) {
    return this
  }
  onImageUploadModelSet(event, imageUploadModel) {
    Channels.channel('Application').request('router').navigate(`/photos/${event.data.id}`)
    return this
  }
  onViewInput(event, view) {
    const data = new FormData()
    data.set('file', event.data.file)
    data.set('sub_id', this.models.user.get('subID'))
    this.models.settings.set('imageReady', true)
    this.views.view
      .renderElement('uploadImagePreview', 'afterbegin', event.data.image)
    this.models.imageUpload.services.post.body = data
    return this
  }
  onViewClick(event, view) {
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