module.exports = {
  props: {
    "height": {
      type: Number
    },
    "data": {
      "default": null
    },
    "loading": {
      type: Number,
      "default": 0
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
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div v-bind:style=\"{height:height+'px',overflow:'visible',display:loading?'none':null}\" class=clusterize-row></div>"
