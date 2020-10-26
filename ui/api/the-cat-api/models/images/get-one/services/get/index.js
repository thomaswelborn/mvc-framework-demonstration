import { mergeDeep } from 'utilities/scripts'
import { Service } from 'mvc-framework/source/MVC'

export default class extends Service {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      method: 'GET',
      url: `https://api.thecatapi.com/v1/images/${options.ui.get('id')}`,
      headers: {
        'x-api-key': options.user.get('apiKey'),
      },
    }, settings), mergeDeep({}, options))
  }
}