module.exports = {
  "_id": "process-bs-config",
  "template": "generator/templates/processes/bs-config/index.ejs",
  "destination": "processes/bs-config.js",
  "overwrite": true,
  "merge": false,
  "data": {
    "server": {
      "baseDir": "localhost",
      "directory": false,
    },
    "host": "localhost",
    "port": 9000,
    "files": ["localhost"],
    "cors": true,
    "https": true,
  }
}