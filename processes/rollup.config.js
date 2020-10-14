const $path = require('path')
const rollup = {
  plugins: {
    nodeResolve: require('@rollup/plugin-node-resolve').nodeResolve,
    ejs: require('rollup-plugin-ejs'),
    commonJS: require('@rollup/plugin-commonjs'),
    babel: require('@rollup/plugin-babel').babel,
    json: require('@rollup/plugin-json'),
  },
}
module.exports = {
  input: 'ui/index.js',
  output: {
    "file": "localhost/scripts/bundle.js",
    "format": "umd",
    "sourcemap": "inline"
  },
  plugins: [
    rollup.plugins.nodeResolve(),
    rollup.plugins.ejs(),
    rollup.plugins.commonJS(),
    rollup.plugins.json(),
    rollup.plugins.babel({
      babelHelpers: 'bundled',
      plugins: [
        ['babel-plugin-module-resolver', {
          root: ["./ui", "./node_modules"]
        }, ],
      ],
    }),
  ],
  watch: {
    chokidar: true,
    include: ["./processes/rollup.config.js", "./ui/**"],
  },
}