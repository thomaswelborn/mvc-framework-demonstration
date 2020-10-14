import { mergeDeep } from 'utilities/scripts'
import { Service } from 'mvc-framework/source/MVC'

export default class extends Service {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      type: 'GET',
      url: 'https://api.thecatapi.com/v1/images/search',
      headers: {
        'x-api-key': String(),
      },
      parameters: {
        order: String(),
        limit: 1,
        page: 1,
      },
    }, settings), mergeDeep({}, options))
  }
}