const $path = require('path')
const $fs = require('fs')
const globby = require('globby')
const ejs = require('ejs')
const beautify = require('js-beautify')
const files = globby.sync('documents/data/**/*.json')
files.forEach(async (fileLocation) => {
  const fileData = JSON.parse($fs.readFileSync(fileLocation).toString())
  const fileDestination = $path.dirname(fileData.output)
  const file = beautify.html(await ejs.renderFile(fileData.template, fileData.data, {
    localsName: 'data',
  }), {
    indent_size: 2,
    preserve_newlines: false,
  })
  $fs.mkdirSync(fileDestination, {
    recursive: true,
  }, )
  $fs.writeFileSync(fileData.output, file, )
  console.log(`Created new document: ${fileData.output}`)
})