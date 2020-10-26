import { mergeDeep } from 'utilities/scripts'
import { isAuthenticated } from 'utilities/scripts/mvc-framework/methods'
import { AsyncController } from 'utilities/scripts/mvc-framework/controllers'
import { Model } from 'mvc-framework/source/MVC'
import {
  POSTServiceError as POSTServiceErrorDefaults,
  Options as OptionsDefaults,
} from './defaults'
import { PostOne as ImagePostOneModel } from 'api/the-cat-api/models/images'
import View from './view'
import Channels from 'modules/channels'

export default class extends AsyncController {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      models: {
        ui: new Model(OptionsDefaults.models.ui),
        imagePostOne: new ImagePostOneModel({}, {
          user: settings.models.user,
        }),
      },
      modelEvents: {
        'ui set:imageReady': 'onUIModelSetImageReady',
        'imagePostOne ready': 'onImageUploadReady',
        'imagePostOne set': 'onImagePostOneModelSet',
        'imagePostOne error': 'onImagePostOneModelError',
      },
      modelCallbacks: {
        onUIModelSetImageReady: (event, settingsModel) => this.onUIModelSetImageReady(event, settingsModel),
        onImageUploadReady: (event, imagePostOneModel) => this.onImageUploadReady(event, imagePostOneModel),
        onImagePostOneModelSet: (event, imagePostOneModel) => this.onImagePostOneModelSet(event, imagePostOneModel),
        onImagePostOneModelError: (event, imagePostOneModel) => this.onImagePostOneModelError(event, imagePostOneModel),
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
      controllers: {},
    }, settings), mergeDeep({
      controllers: {
        error: POSTServiceErrorDefaults,
      },
    }, options))
  }
  get viewData() { return {
    ui: this.models.ui.parse(),
  } }
  onErrorControllerButtonClick(event, errorController) {
    switch(event.data.action) {
      case 'refresh':
        Channels.channel('Application').request('router')
          .navigate('')
          .navigate(this.models.route.get('location').hash.string)
        break
    }
  }
  onUIModelSetImageReady(event, settingsModel) {
    this.models.ui.set('loading', false)
    return this.renderView()
  }
  onImagePostOneModelError(event, imagePostOneModel) {
    this.models.ui.set('loading', false)
    return this.startErrorController(event.data, () => {
      Channels.channel('Application').request('router')
        .navigate('/')
        .navigate('/upload')
    })
  }
  onImageUploadReady(event, imagePostOneModel) {
    this.models.imagePostOne.set(event.data)
    return this
  }
  onImagePostOneModelSet(event, imagePostOneModel) {
    Channels.channel('Application').request('router').navigate(`/photos/${event.data.id}`)
    return this
  }
  onViewImageInput(event, view) {
    const data = new FormData()
    data.set('file', event.data.file)
    data.set('sub_id', this.models.user.get('subID'))
    this.models.ui.set('imageReady', true)
    this.views.view
      .renderElement('uploadImagePreview', 'afterbegin', event.data.image)
    this.models.imagePostOne.services.post.body = data
    return this
  }
  onViewUploadButtonClick(event, view) {
    this.models.ui.set('loading', true)
    this.models.imagePostOne.services.post.fetch()
    return this
  }
  renderView() {
    this.views.view.render(this.viewData)
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