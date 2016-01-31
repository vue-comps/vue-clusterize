var __vueify_style__ = require("vueify-insert-css").insert("div.clusterize-row {\n  overflow: visible;\n}\n")
module.exports = {
  props: {
    "height": {
      type: Number
    },
    "data": {
      "default": null
    }
  },
  el: function() {
    return document.createElement("div");
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div v-bind:style=\"{height:height+'px'}\" v-show=\"data != null\" class=\"clusterize-row\"><slot></slot></div>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/home/peaul"
  module.hot.dispose(function () {
    require("vueify-insert-css").cache["div.clusterize-row {\n  overflow: visible;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}