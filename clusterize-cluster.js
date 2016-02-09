var __vueify_style__ = require("vueify-insert-css").insert("div.clusterize-cluster{overflow:visible;margin:0;padding:0;position:relative}")
var Vue;

Vue = require("vue");

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
  compiled: function() {
    this.end = Vue.util.createAnchor('clusterize-cluster-end');
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
      Vue.util.defineReactive(scope, this.bindingName, this.data[i]);
      Vue.util.defineReactive(scope, "height", this.rowHeight);
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
      console.log(newData);
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
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div v-bind:class={loading:loading} class=clusterize-cluster><div v-el:loading=v-el:loading v-bind:style=\"{height:data.length*rowHeight+'px'}\" v-show=loading class=clusterize-cluster-loading><slot>loading...</slot></div></div>"
