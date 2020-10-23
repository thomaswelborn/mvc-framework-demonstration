import { mergeDeep } from 'utilities/scripts'
import { Service } from 'mvc-framework/source/MVC'

export default class extends Service {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      method: 'GET',
      url: `https://api.thecatapi.com/v1/favourites/${Object(options.route.get('location')).hash.fragments.slice(-1)[0]}`,
      headers: {
        'x-api-key': options.user.get('apiKey'),
      },
      parameters: {
        favourite_id: Object(options.route.get('location')).hash.fragments.slice(-1)[0],
      }
    }, settings), mergeDeep({}, options))
  }
}