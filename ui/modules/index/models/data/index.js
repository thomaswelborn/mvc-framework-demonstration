import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'
import { GET } from './services'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      services: {
        get: new GET({
          headers: {
            'x-api': options.user.api_key,
          },
          parameters: {
            'sub_id': options.user.sub_id,
          },
        }),
      },
    }, settings), mergeDeep({}, options))
  }
}