import { mergeDeep } from 'utilities/scripts'
import { Service } from 'mvc-framework/source/MVC'

export default class extends Service {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      method: 'GET',
      url: 'https://api.thecatapi.com/v1/images',
      headers: {
        'x-api-key': options.user.get('apiKey'),
      },
      parameters: {
        'order': options.ui.get('order'),
        'page': options.ui.get('page'),
        'limit': options.ui.get('limit'),
        'sub_id': options.user.get('subID'),
      },
    }, settings), mergeDeep({}, options))
    this.options.ui
      .on('set:order', (event) => {
        this.parameters.order = event.data.value
        this.parameters.page = 0
        this.fetch()
      })
      .on('set:page', (event) => {
        this.parameters.page = event.data.value
        this.fetch()
      })
  }
}