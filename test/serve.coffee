webpack = require "webpack"
webpackDevServer = require "webpack-dev-server"
path = require "path"
ip = require "ip"
http = require "http"
#chokidar = require('chokidar')
config =
  entry:
    "index": ["./test/index.coffee"]
  output:
    path: path.resolve(__dirname, "test")
    filename: "[name].js"
  module:
    loaders: [
      { test: /\.vue$/, loader: "vue"}
      { test: /\.html$/, loader: "html"}
      { test: /\.jade$/, loader: "html?jade-loader"}
      { test: /\.coffee$/, loader: "coffee-loader"}
      { test: /\.css$/, loader: "style-loader!css-loader" }
      { test: /\.png$/, loader: "url-loader?limit=10000" }
      { test: /\.jpg$/, loader: "file-loader" }
      { test: /\.woff(\d*)\??(\d*)$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" }
      { test: /\.ttf\??(\d*)$/,    loader: "file-loader" }
      { test: /\.eot\??(\d*)$/,    loader: "file-loader" }
      { test: /\.svg\??(\d*)$/,    loader: "file-loader" }
      { test: /\.scss$/, loader: "style!css!sass?sourceMap"}
    ]
  plugins: [new webpack.HotModuleReplacementPlugin()]

config.entry["index"].unshift("webpack-dev-server/client?http://#{ip.address()}:8080/","webpack/hot/dev-server")
compiler = webpack(config)
server = null
start = ->
  server = new webpackDevServer compiler, {
    hot:true
    contentBase: "test/"
    quiet: true
  }
  server.listen 8080, ->
    console.log "get on http://#{ip.address()}:8080/"
restart = ->
  console.log "restarting.."
  server.close ->
    start()
start()
#chokidar.watch("./test",ignoreInitial:true).on("add",restart)
