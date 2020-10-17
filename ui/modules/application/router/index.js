import { mergeDeep } from 'utilities/scripts'
import { Router } from 'mvc-framework/source/MVC'

export default class extends Router {
  constructor(settings = {}, options = {}) {
    super(mergeDeep({
      hashRouting: true,
      routes: {
        '/': {
          name: 'Index',
          callback: 'loadModule'
        },
        '/account/login': {
          name: 'Login',
          callback: 'loadModule',
        },
        '/account/logout': {
          name: 'Logout',
          callback: 'loadModule',
        },
        '/account/profile': {
          name: 'Profile',
          callback: 'loadModule',
        },
        '/photos': {
          name: 'Photos',
          callback: 'loadModule',
        },
        '/photos/:photo': {
          name: 'Photo',
          callback: 'loadModule',
        },
        '/upload': {
          name: 'Upload',
          callback: 'loadModule',
        },
      },
    }, settings), options)
  }
  start() {
    const currentHash = window.location.hash
    window.location.hash = '#'
    this.navigate(currentHash)
    return this
  }
}