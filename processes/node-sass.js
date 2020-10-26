const $fs = require('fs')
const $path = require('path')
const sass = require('node-sass')
const colors = require('colors')
const output = {
  "directory": "./localhost/styles/",
  "file": "bundle.css",
  "style": "expanded",
  "sourceMap": true
}
output.destination = $path.join(output.directory, output.file)
const input = {
  "file": "./ui/index.scss",
  "includePaths": ["./ui", "./media"]
}
const results = sass.renderSync({
  file: input.file,
  includePaths: input.includePaths,
  outputStyle: output.style,
  outFile: output.destination,
  sourceMap: true,
  sourceMapEmbed: true,
})
$fs.mkdirSync(output.directory, {
  recursive: true,
}, )
$fs.writeFileSync(output.destination, results.css.toString(), )
console.log(colors.rainbow('node-sass', ), '\n', colors.brightBlue(`${input.file} => ${output.destination}`, ), )