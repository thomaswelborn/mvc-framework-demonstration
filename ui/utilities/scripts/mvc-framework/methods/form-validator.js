export default (validators, formData, templates) => {
  const formValidator = Object.entries(validators).reduce((_formValidator, [validatorName, validatorSettings]) => {
    const formDataValue = formData[validatorName]
    const validator = Object.entries(validatorSettings).reduce((_validators, [validatorTypeName, validatorTypeSettings]) => {
      switch(validatorTypeName) {
        case 'minLength':
          if(formDataValue.length < validatorTypeSettings.value) {
            _validators[validatorTypeName] = {
              name: validatorTypeSettings.name,
              validated: false,
              message: validatorTypeSettings.messages.error,
            }
            _validators[validatorTypeName].html = templates.error(_validators[validatorTypeName])
          } else if(formDataValue.length >= validatorTypeSettings.value){
              _validators[validatorTypeName] = {
              name: validatorTypeSettings.name,
              validated: true,
              message: validatorTypeSettings.messages.success,
            }
          }
          break
        case 'validCharacters':
          if(formDataValue.match(validatorTypeSettings.value)) {
            _validators[validatorTypeName] = {
              name: validatorTypeSettings.name,
              validated: true,
              message: validatorTypeSettings.messages.success,
              }
          } else {
            _validators[validatorTypeName] = {
              name: validatorTypeSettings.name,
              validated: false,
              message: validatorTypeSettings.messages.error,
            }
            _validators[validatorTypeName].html = templates.error(_validators[validatorTypeName])
          }
          break
      }
      return _validators
    }, {})
    const isValidatorValid = Object.values(validator).find((validator) => validator.validated === false)
      ? false
      : true
    if(isValidatorValid) {
      _formValidator.totals.success += 1
      _formValidator.success[validatorName] = validator
    } else {
      _formValidator.totals.error += 1
      _formValidator.error[validatorName] = validator
    }
    return _formValidator
  }, {
    totals: {
      error: 0,
      success: 0,
    },
    error: {},
    success: {},
  })
  return formValidator
}