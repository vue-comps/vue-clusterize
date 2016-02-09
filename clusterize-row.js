var __vueify_style__ = require("vueify-insert-css").insert("div.clusterize-row{overflow:visible}")
module.exports = {
  props: {
    "height": {
      type: Number
    },
    "data": {
      "default": null
    }
  },
  data: function() {
    return {
      isRow: true
    };
  },
  el: function() {
    return document.createElement("div");
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div v-bind:style=\"{height:height+'px'}\" v-show=\"data != null\" class=clusterize-row></div>"
