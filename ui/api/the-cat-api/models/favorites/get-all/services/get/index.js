import { mergeDeep } from 'utilities/scripts'
import { Service } from 'mvc-framework/source/MVC'

export default class extends Service {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      method: 'GET',
      url: `https://api.thecatapi.com/v1/favourites`,
      headers: {
        'x-api-key': options.user.get('apiKey'),
      },
      parameters: {
        sub_id: options.user.get('subID'),
        page: options.ui.get('page'),
        limit: options.ui.get('limit'),
      }
    }, settings), mergeDeep({}, options))
    this.options.ui
      .on('set:page', (event) => {
        this.parameters.page = event.data.value
        this.fetch()
      })
  }
}