import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      type: 'GET',
      url: 'https://api.thecatapi.com/v1/images/search',
      headers: {
        'x-api': '',
      },
      parameters: {
        sub_id: '',
      },
    }, settings), mergeDeep({}, options))
  }
}