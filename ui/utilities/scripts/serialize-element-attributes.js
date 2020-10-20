import convertDashToCamel from './convert-dash-to-camel'
export default (attributes) => {
  return Array.from(attributes).reduce((_attributes, attribute) => {
    _attributes[
      convertDashToCamel(attribute.name.replace(new RegExp(/data-/), ''))
    ] = attribute.value
    return _attributes
  }, {})
}
