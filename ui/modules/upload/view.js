import { mergeDeep } from 'utilities/scripts'
import { RenderView } from 'library/mvc-framework'
import Template from './template.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'upload',
      },
      template: Template,
      uiElements: {
        imageInput: ':scope > main #upload-image-input',
        uploadButton: ':scope > main #upload-image-button',
        uploadImagePreview: ':scope > main #upload-image-preview',
      },
      uiElementEvents: {
        'imageInput change': 'onImageInputChange',
        'uploadButton click': 'onUploadButtonClick',
      },
      uiElementCallbacks: {
        onUploadButtonClick: (event) => this.onUploadButtonClick(event),
        onImageInputChange: (event) => this.onImageInputChange(event),
      },
    }, settings), mergeDeep({}, options))
  }
  async onImageInputChange(event) {
    const image = document.createElement('img')
    const reader = new FileReader()
    const file = this.ui.imageInput.files[0]
    reader.addEventListener('load', (event) => {
      image.src = event.target.result
      this
        .emit(
          'input',
          {
            file: file,
            image: image,
          },
          this,
        )
    })
    reader.readAsDataURL(file)
    return this
  }
  onUploadButtonClick(event) {
    return this
      .emit(
        'click',
        {
          action: event.currentTarget.getAttribute('data-action'),
        },
        this,
      )
  }
}