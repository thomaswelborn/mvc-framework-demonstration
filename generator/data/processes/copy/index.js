module.exports = {
  "_id": "process-copy",
  "template": "generator/templates/processes/copy/index.ejs",
  "destination": "processes/copy.js",
  "overwrite": true,
  "merge": false,
  "data": {
    "scripts": {
      "source": [
        // "node_modules/mvc-framework/.js"
      ],
      "destinations": [
        // {
        //   "path": "./release/scripts/dependencies",
        //   "cwd": true,
        // }
      ]
    },
    "styles": {
      "source": [],
      "destinations": []
    },
    "fonts": {
      "source": [
        "media/fonts/**"
      ],
      "destinations": [
        {
          "path": "localhost",
          "cwd": true
        }
      ]
    }
  }
}