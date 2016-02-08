require "../node_modules/mocha/mocha.css"

Vue = require "vue"
Vue.config.debug=true
app = new Vue
  el:"#app"
  components:
    "clusterize": require "../clusterize.js"
    "clusterize-row": require "../clusterize-row.js"
  data: ->
    rowsData: (x for x in [1...10000])

ClusterizeTest = require "mocha!./clusterize.coffee"
