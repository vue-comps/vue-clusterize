require "../node_modules/mocha/mocha.css"

Vue = require "vue"
Vue.config.debug=true
app = new Vue
  el:"#app"
  components:
    "clusterize": require "../clusterize.js"
    "clusterize-row": require "../clusterize-row.js"
  data: ->
    rowsData: (x for x in [1...1000])
  methods:
    rowsBuilder: (count) ->
      rows = []
      for j in [1..count]
        row = new Vue(require("../clusterize-row.js"))
        rows.push row
      return rows

ClusterizeTest = require "mocha!./clusterize.coffee"
