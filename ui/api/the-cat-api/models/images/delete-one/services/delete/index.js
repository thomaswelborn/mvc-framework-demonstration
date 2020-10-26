import { mergeDeep } from 'utilities/scripts'
import { Service } from 'mvc-framework/source/MVC'

export default class extends Service {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      method: 'DELETE',
      url: `https://api.thecatapi.com/v1/images/${options.ui.get('id')}`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.user.get('apiKey'),
      },
      parameters: {
        image_id: options.ui.get('id'),
      },
    }, settings), mergeDeep({}, options))
  }
}