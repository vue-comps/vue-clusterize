module.exports = {
  mixins: [require("vue-mixins/vue")],
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
  ready: function() {
    var key, ref, results, val;
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
      this.Vue.util.defineReactive(scope, "loading", this.loading);
      ref = this.rowWatchers;
      for (key in ref) {
        val = ref[key];
        this.Vue.util.defineReactive(scope, key, val.vm[val.prop]);
        scope[key] = val.vm[val.prop];
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
    "rowWatchers": function(newRW, oldRW) {
      var key, results, val;
      results = [];
      for (key in newRW) {
        val = newRW[key];
        if (oldRW[key] == null) {
          results.push(this.initRowWatchers(key, val));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
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
    loading: function(newLoading) {
      var frag, j, len, ref, results;
      ref = this.frags;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        frag = ref[j];
        results.push(frag.scope.loading = newLoading);
      }
      return results;
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div class=clusterize-cluster :class={loading:loading} :style=\"{height:height+'px',overflow:'visible',position:'relative',margin:0,padding:0}\"><div class=clusterize-cluster-loading v-el:loading=v-el:loading v-show=loading><slot>loading...</slot></div></div>"
