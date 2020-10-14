const $path = require('path')
const $fs = require('fs')
const yargs = require('yargs')
const globby = require('globby')
const ejs = require('ejs')
const beautify = require('js-beautify')

const filesData = (yargs.parse().files)
  ? yargs.parse().files
  : './data'
const Settings = require(filesData)

const Generate = async (settings) => {
  if(settings._id) {
    let currentFile
    try {
      currentFile = $fs.readFileSync(settings.destination)
    } catch(error) { console.log(
      'Destination does not exist.'
    ) }
    if(
      (
        currentFile &&
        settings.overwrite
      ) || 
      !currentFile
    ) {
      if(!currentFile) console.log(`Creating new file from ${settings.template}`)
      if(
        currentFile && 
        settings.overwrite
      ) console.log(
        `Overwriting existing file at ${settings.destination}`
      )
      let newFile
      if($path.parse(settings.destination).ext === '.ejs') {
        newFile = $fs.readFileSync(settings.template).toString()
      } else {
        newFile = await ejs.renderFile(
          $path.resolve(settings.template),
          settings.data,
          {
            filename: settings.template,
            localsName: 'data',
          }
        )
        newFile = beautify(newFile, {
          indent_size: 2,
          preserve_newlines: false,
        })
      }
      $fs.mkdirSync(
        $path.dirname(settings.destination),
        {
          recursive: true,
        },
      )
      $fs.writeFileSync(
        settings.destination,
        newFile
      )
      if(!currentFile) console.log(
        `New file created at ${settings.destination}`
      )
      if(
        currentFile && 
        settings.overwrite
      ) console.log(
        `Existing file overwritten at ${settings.destination}`
      )
    }
  } else {
    Object.entries(settings).forEach(([generatorName, generator]) => Generate(generator))
  }
}

Generate(Settings)

