import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        order: 'RANDOM',
        page: 0,
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