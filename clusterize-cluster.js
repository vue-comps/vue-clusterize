var __vueify_style__ = require("vueify-insert-css").insert("div.clusterize-cluster {\n  overflow: visible;\n  margin: 0;\n  padding: 0;\n  position: relative;\n}\n")
module.exports = {
  props: {
    "bindingName": {
      type: String,
      "default": "data"
    },
    "loading": {
      type: Number,
      "default": 0
    },
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
      isCluster: true,
      factory: null,
      Vue: null,
      end: null,
      frags: []
    };
  },
  ready: function() {
    this.Vue = this.$root.constructor;
    this.end = this.Vue.util.createAnchor('clusterize-cluster-end');
    return this.$el.appendChild(this.end);
  },
  methods: {
    createFrag: function(i) {
      var frag, parentScope, scope;
      parentScope = this.$parent.$parent;
      scope = Object.create(parentScope);
      scope.$refs = Object.create(parentScope.$refs);
      scope.$els = Object.create(parentScope.$els);
      scope.$parent = parentScope;
      scope.$forContext = this;
      this.Vue.util.defineReactive(scope, this.bindingName, this.data[i]);
      this.Vue.util.defineReactive(scope, "height", this.rowHeight);
      this.Vue.util.defineReactive(scope, "loading", this.loading);
      frag = this.factory.create(this, scope, this.$options._frag);
      frag.before(this.end);
      return this.frags[i] = frag;
    },
    destroyFrag: function(i) {
      return this.frags[i].remove();
    }
  },
  watch: {
    data: function(newData, oldData) {
      var diff, frag, i, index, j, k, l, len, ref, ref1, ref2, results;
      diff = newData.length - oldData.length;
      if (diff > 0) {
        for (i = j = 0, ref = diff; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          this.createFrag(oldData.length + i);
        }
      } else if (diff < 0) {
        for (i = k = ref1 = diff; ref1 <= 0 ? k < 0 : k > 0; i = ref1 <= 0 ? ++k : --k) {
          this.destroyFrag(oldData.length + i);
        }
      }
      ref2 = this.frags;
      results = [];
      for (index = l = 0, len = ref2.length; l < len; index = ++l) {
        frag = ref2[index];
        results.push(frag.scope.data = newData[index]);
      }
      return results;
    },
    rowHeight: function(newHeight) {
      var frag, index, j, len, ref, results;
      ref = this.frags;
      results = [];
      for (index = j = 0, len = ref.length; j < len; index = ++j) {
        frag = ref[index];
        results.push(frag.scope.height = newHeight);
      }
      return results;
    },
    loading: function(loading) {
      var frag, index, j, len, ref, results;
      ref = this.frags;
      results = [];
      for (index = j = 0, len = ref.length; j < len; index = ++j) {
        frag = ref[index];
        results.push(frag.scope.loading = loading);
      }
      return results;
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div class=\"clusterize-cluster\"><div v-el:loading=\"v-el:loading\" v-bind:style=\"{height:data.length*rowHeight+'px'}\" v-show=\"loading\" class=\"clusterize-cluster-loading\"><slot>loading...</slot></div></div>"
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