import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      defaults: {
        auth: true,
        noAuth: true,
        header: {
          select: {
            options: [
              {
                value: 'random',
                textContent: 'Random',
              },
              {
                value: 'latest',
                textContent: 'Latest',
              },
            ],
          },
        },
      },
    }, settings), mergeDeep({}, options))
  }
}