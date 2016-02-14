module.exports = (config) ->
  config.set
    preprocessors:
      "**/*.coffee": ["webpack",'sourcemap']
    webpack:
      devtool: 'inline-source-map'
      resolve:
        extensions: ["",".js",".coffee",".vue"]
      module:
        loaders: [
          { test: /\.coffee$/, loader: "coffee-loader" }
          { test: /\.vue$/, loader: "vue-loader" }
          { test: /\.html$/, loader: "html"}
          { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    webpackMiddleware:
      noInfo: true
    files: ["test/*.coffee"]
    frameworks: ["mocha","chai-dom","chai-spies","chai","vue-component"]
    plugins: [
      require("karma-chai")
      require("karma-chai-dom")
      require("karma-chrome-launcher")
      require("karma-firefox-launcher")
      require("karma-mocha")
      require("karma-webpack")
      require("karma-sourcemap-loader")
      require("karma-spec-reporter")
      require("karma-chai-spies")
      require("karma-vue-component")
    ]
    browsers: ["Chrome","Firefox"]
