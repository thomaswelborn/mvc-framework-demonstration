import { mergeDeep } from 'utilities/scripts'
import { Service } from 'mvc-framework/source/MVC'

export default class extends Service {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      method: 'GET',
      url: 'https://api.thecatapi.com/v1/images/search',
      headers: {
        'x-api-key': String(),
      },
      parameters: {
        order: String(),
        limit: Number(1),
        page: Number(),
      },
    }, settings), mergeDeep({}, options))
  }
}