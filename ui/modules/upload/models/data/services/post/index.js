import { mergeDeep } from 'utilities/scripts'
import { Service } from 'mvc-framework/source/MVC'

export default class extends Service {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      method: 'POST',
      url: 'https://api.thecatapi.com/v1/images/upload',
      mode: 'cors',
      referrerPolicy: 'origin',
      headers: {
        // 'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': 'localhost',
      },
    }, settings), mergeDeep({}, options))
  }
}