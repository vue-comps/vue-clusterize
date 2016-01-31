var __vueify_style__ = require("vueify-insert-css").insert("div.clusterize-cluster {\n  overflow: visible;\n  margin: 0;\n  padding: 0;\n  position: relative;\n}\n")
module.exports = {
  props: {
    "nr": {
      type: Number
    },
    "rowHeight": {
      type: Number
    },
    "data": {
      type: Array,
      "default": function() {
        return [];
      }
    }
  },
  data: function() {
    return {
      isCluster: true
    };
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div v-el:cluster=\"v-el:cluster\" class=\"clusterize-cluster\"><slot v-bind:height=\"rowHeight\" v-bind:data.sync=\"d\" v-for=\"d in data\"></slot></div>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/home/peaul"
  module.hot.dispose(function () {
    require("vueify-insert-css").cache["div.clusterize-cluster {\n  overflow: visible;\n  margin: 0;\n  padding: 0;\n  position: relative;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}