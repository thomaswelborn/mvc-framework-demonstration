const $fs = require('fs')
const $path = require('path')
const globby = require('globby')
const configuration = Object.values({
  "scripts": {
    "source": [],
    "destinations": []
  },
  "styles": {
    "source": [],
    "destinations": []
  }
}).forEach((copyElement) => {
  copyElement.source.forEach((sourceLocation) => {
    const file = $fs.readFileSync($path.resolve(__dirname, '..', sourceLocation))
    copyElement.destinations.forEach((destination) => {
      const destinationLocation = (destination.cwd) ? $path.resolve(__dirname, '..', destination.path, sourceLocation) : $path.resolve(__dirname, '..', destination.path, $path.parse(sourceLocation).base)
      console.log('Copy', sourceLocation, '=>', destinationLocation)
      $fs.mkdirSync($path.dirname(destinationLocation), {
        recursive: true
      })
      $fs.writeFileSync(destinationLocation, file)
    })
  })
})