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
  },
  "fonts": {
    "source": ["media/fonts/**"],
    "destinations": [{
      "path": "localhost",
      "cwd": true
    }]
  }
}).forEach((copyElement) => {
  copyElement.source.forEach((sourceLocation) => {
    const files = globby.sync($path.resolve(__dirname, '..', sourceLocation)) || Array()
    files.forEach((fileLocation) => {
      // const file = $fs.readFileSync(fileLocation)
      copyElement.destinations.forEach((destination) => {
        const destinationLocation = $path.resolve(destination.path, $path.relative('.', fileLocation))
        $fs.mkdirSync($path.dirname(destinationLocation), {
          recursive: true
        })
        $fs.copyFileSync(fileLocation, destinationLocation)
      })
    })
  })
})