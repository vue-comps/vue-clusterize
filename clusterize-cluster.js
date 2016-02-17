var __vueify_style__ = require("vueify-insert-css").insert("div.clusterize-cluster{overflow:visible;margin:0;padding:0;position:relative}.clusterize-cluster.loading>.clusterize-row{display:none}")
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
    "height": {
      type: Number
    },
    "data": {
      type: Array,
      "default": function() {
        return [];
      }
    },
    "rowWatchers": {
      type: Object
    },
    "parentVm": {
      type: Object
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
    var key, ref, results, val;
    if (this.$root.construtor != null) {
      this.Vue = this.$root.construtor;
    } else {
      this.Vue = Object.getPrototypeOf(Object.getPrototypeOf(this.$root)).constructor;
    }
    this.end = this.Vue.util.createAnchor('clusterize-cluster-end');
    this.$el.appendChild(this.end);
    ref = this.rowWatchers;
    results = [];
    for (key in ref) {
      val = ref[key];
      results.push(this.initRowWatchers(key, val));
    }
    return results;
  },
  methods: {
    createFrag: function(i) {
      var frag, key, parentScope, ref, scope, val;
      parentScope = this.parentVm;
      scope = Object.create(parentScope);
      scope.$refs = Object.create(parentScope.$refs);
      scope.$els = Object.create(parentScope.$els);
      scope.$parent = parentScope;
      scope.$forContext = this;
      this.Vue.util.defineReactive(scope, this.bindingName, this.data[i]);
      console.log(this.rowWatchers);
      ref = this.rowWatchers;
      for (key in ref) {
        val = ref[key];
        this.Vue.util.defineReactive(scope, key, val.vm[val.prop]);
      }
      frag = this.factory.create(this, scope, this.$options._frag);
      frag.before(this.end);
      return this.frags[i] = frag;
    },
    destroyFrag: function(i) {
      return this.frags[i].remove();
    },
    initRowWatchers: function(key, obj) {
      var self;
      self = this;
      return obj.vm.$watch(obj.prop, function(val) {
        var frag, j, len, ref, results;
        ref = self.frags;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          frag = ref[j];
          results.push(frag.scope[key] = val);
        }
        return results;
      });
    },
    redraw: function() {
      var i, j, ref, results;
      if (this.frags.length > 0) {
        results = [];
        for (i = j = 0, ref = this.frags.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          this.destroyFrag(i);
          results.push(this.createFrag(i));
        }
        return results;
      }
    }
  },
  watch: {
    "factory": "redraw",
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
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div v-bind:class={loading:loading} v-bind:style=\"{height:height+'px'}\" class=clusterize-cluster><div v-el:loading=v-el:loading v-show=loading class=clusterize-cluster-loading><slot>loading...</slot></div></div>"
