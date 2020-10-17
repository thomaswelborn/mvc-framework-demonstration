import {
  mergeDeep,
  formValidator,
} from 'utilities/scripts'
import { RenderView } from 'utilities/scripts/mvc-framework'
import Template from './templates/template.ejs'
import ErrorTemplate from './templates/validator.ejs'

export default class extends RenderView {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      elementName: 'section',
      attributes: {
        id: 'login',
      },
      template: Template,
      uiElements: {
        username: '#login-username-input',
        apiKey: '#login-api-key-input',
        submitButton: '#login-button',
        footer: ':scope > footer',
      },
      uiElementEvents: {
        'submitButton click': 'onSubmitButtonClick',
      },
      uiElementCallbacks: {
        onSubmitButtonClick: (event) => this.onSubmitButtonClick(event),
      },
    }, settings), mergeDeep({}, options))
  }
  get validators() { return {
    username: {
      minLength: {
        name: 'username',
        value: 3,
        messages: {
          error: 'Username must be at least 3 characters.',
          success: 'Success.',
        },
        template: ErrorTemplate,
      },
        validCharacters: {
        name: 'username',
        value: new RegExp(/\w*[a-zA-Z0-9_]\w*/),
        messages: {
          error: 'Username must contain only alphanumeric characters (no spaces, dashes, underscores, or special characters).',
          success: 'Success.',
        },
        template: ErrorTemplate,
      },
    },
  } }
  onSubmitButtonClick(event) {
    this.validateForm()
    return this
  }
  parseForm() { return {
    username: this.ui.username.value,
    apiKey: this.ui.apiKey.value,
  } }
  validateForm() {
    this.empty('footer')
    const formValidation = formValidator(this.validators, this.parseForm(), {
      error: ErrorTemplate,
    })
    if(formValidation.totals.error.length) {
      const validationTemplate = Object.values(formValidation.error).reduce((_template, formValidationProperty) => {
        return _template.concat(
          Object.values(formValidationProperty).reduce((_propertyTemplate, formValidationPropertyCriteria) => {
            return (!formValidationPropertyCriteria.validated)
              ? _propertyTemplate.concat(formValidationPropertyCriteria.html)
              : _propertyTemplate
          }, '')
        )
      }, '')
      this.ui.footer.innerHTML = validationTemplate
    } else {
      this.emit(
        'form:validated',
        this.parseForm(),
        this
      )
    }
    return this
  }
}
