import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      // localStorage: {
      //   sync: true,
      //   endpoint: '/api/index/settings',
      // },
      defaults: {
        auth: true,
        noAuth: true,
        redirect: 'account/login',
        order: 'RANDOM',
        page: 0,
        limit: 1,
      },
    }, settings), mergeDeep({}, options))
  }
  advancePage(pages) {
    let currentPage = this.get('page')
    let nextPage = (currentPage + pages < 0)
      ? 0
      : currentPage + pages
    this.set('page', nextPage)
    return this
  }
}