import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      localStorage: {
        sync: true,
        endpoint: '/api/index/settings',
      },
      defaults: {
        auth: true,
        noAuth: true,
        order: 'RANDOM',
        page: 1,
        header: {
          select: {
            options: [
              {
                value: 'RANDOM',
                textContent: 'Random',
              },
              {
                value: 'DESC',
                textContent: 'Latest',
              },
            ],
          },
        },
      },
    }, settings), mergeDeep({}, options))
  }
}