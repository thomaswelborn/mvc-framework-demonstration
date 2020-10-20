export default (name) => {
  return name
    .split('-')
    .reduce((_name, nameFragment, nameFragmentIndex) => {
      if(nameFragmentIndex) {
        let nameFragmentCharacters = nameFragment.split('')
        let firstCharacter = nameFragmentCharacters.shift().toUpperCase()
        nameFragmentCharacters.unshift(firstCharacter)
        nameFragment = nameFragmentCharacters.join('')
      }
      _name = _name.concat(nameFragment)
      return _name
    }, '')
}
