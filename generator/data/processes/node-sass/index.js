module.exports = {
  "_id": "process-node-sass",
  "template": "generator/templates/processes/node-sass/index.ejs",
  "destination": "processes/node-sass.js",
  "overwrite": true,
  "merge": false,
  "data": {
    "input": {
      "file": "./ui/index.scss",
      "includePaths": [
        "./ui",
      ],
    },
    "output": {
      "directory": "./localhost/styles/",
      "file": "bundle.css",
      "style": "expanded",
      "sourceMap": true,
    }
  }
}