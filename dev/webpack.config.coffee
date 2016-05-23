module.exports =
  module:
    loaders: [
      { test: /\.vue$/, loader: "vue-loader"}
      { test: /\.html$/, loader: "html"}
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  resolve:
    extensions: ["",".js",".vue",".coffee"]
