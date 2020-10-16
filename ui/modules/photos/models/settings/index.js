import { mergeDeep } from 'utilities/scripts'
import { Model } from 'mvc-framework/source/MVC'

export default class extends Model {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      localStorage: {
        sync: true,
        endpoint: '/api/photos/settings',
      },
      defaults: {
        auth: true,
        noAuth: false,
        redirect: 'account/login',
        order: 'ASC',
        page: 0,
        limit: 9,
      },
    }, settings), mergeDeep({}, options))
    this.set({
      page: 0,
    })
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