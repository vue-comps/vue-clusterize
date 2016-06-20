module.exports = {
  mixins: [require("vue-mixins/onElementResize"), require("vue-mixins/vue"), require("vue-mixins/fragToString")],
  components: {
    "clusterize-cluster": require("./clusterize-cluster")
  },
  props: {
    "bindingName": {
      type: String,
      "default": "data"
    },
    "height": {
      type: Number
    },
    "autoHeight": {
      type: Boolean,
      "default": false
    },
    "manualStart": {
      type: Boolean,
      "default": false
    },
    "data": {
      type: Array
    },
    "scrollTop": {
      type: Number,
      "default": 0
    },
    "scrollLeft": {
      type: Number,
      "default": 0
    },
    "clusterSizeFac": {
      type: Number,
      "default": 1.5
    },
    "template": {
      type: String
    },
    "style": {
      type: Object
    },
    "rowWatchers": {
      type: Object,
      "default": function() {
        return {
          height: {
            vm: this,
            prop: "rowHeight"
          }
        };
      }
    },
    "parentVm": {
      type: Object,
      "default": function() {
        return this.$parent;
      }
    }
  },
  computed: {
    position: function() {
      if (this.autoHeight) {
        if (this.disposeResizeCb == null) {
          this.disposeResizeCb = this.onElementResize(this.$el, this.updateHeight);
        }
        return "absolute";
      } else {
        if (typeof this.disposeResizeCb === "function") {
          this.disposeResizeCb();
        }
        return null;
      }
    },
    computedStyle: function() {
      var key, ref, style, val;
      if (!this.state.started) {
        return null;
      }
      style = {
        height: this.height + 'px',
        position: this.position,
        top: this.autoHeight ? 0 : null,
        bottom: this.autoHeight ? 0 : null,
        overflow: "auto"
      };
      if (this.style != null) {
        ref = this.style;
        for (key in ref) {
          val = ref[key];
          style[key] = val;
        }
      }
      return style;
    }
  },
  data: function() {
    return {
      clusters: [],
      rowObj: null,
      firstRowHeight: null,
      lastRowHeight: null,
      rowCount: null,
      rowHeight: null,
      rowsCount: null,
      clustersCount: null,
      clusterHeight: null,
      clusterSize: null,
      clustersBelow: 2,
      clusterVisible: 0,
      clusterVisibleLast: -1,
      offsetHeight: 0,
      minHeight: null,
      lastScrollTop: this.scrollTop,
      lastScrollLeft: this.scrollLeft,
      state: {
        started: false,
        startFinished: false,
        loading: false
      }
    };
  },
  methods: {
    updateHeight: function() {
      if (this.state.startFinished && this.rowHeight > -1 && Math.abs(this.offsetHeight - this.$el.offsetHeight) / this.clusterHeight * this.clusterSizeFac > 0.2) {
        this.calcClusterSize();
        return this.processClusterChange(this.$el.scrollTop, true);
      }
    },
    start: function(top) {
      if (top == null) {
        top = this.$el.scrollTop;
      }
      this.state.started = true;
      this.processTemplate();
      this.state.loading = true;
      if (this.data != null) {
        this.$watch("data", this.processData);
      }
      return this.getData(0, 0, (function(_this) {
        return function(data) {
          _this.getAndProcessDataCount();
          return _this.calcRowHeight(data[0], function() {
            _this.calcClusterSize();
            _this.processScroll(top);
            return _this.state.startFinished = true;
          });
        };
      })(this));
    },
    getData: function(first, last, cb) {
      if (this.data != null) {
        return cb(this.data.slice(first, +last + 1 || 9e9));
      } else {
        return this.$emit("get-data", first, last, cb);
      }
    },
    getAndProcessDataCount: function() {
      var getDataCount, processDataCount;
      getDataCount = (function(_this) {
        return function(cb) {
          if (_this.data != null) {
            return cb(_this.data.length);
          } else {
            return _this.$emit("get-data-count", cb);
          }
        };
      })(this);
      processDataCount = (function(_this) {
        return function(count) {
          if (count > 0) {
            _this.rowsCount = count;
            _this.clustersCount = Math.ceil(_this.rowsCount / _this.clusterSize);
            return _this.updateLastRowHeight();
          }
        };
      })(this);
      return getDataCount(processDataCount);
    },
    calcRowHeight: function(dataPiece, cb) {
      this.clusters[0].data = [dataPiece];
      return this.$nextTick((function(_this) {
        return function() {
          _this.rowHeight = _this.clusters[0].$el.children[1].getBoundingClientRect().height;
          if (_this.rowHeight === 0) {
            throw new Error("height of row is 0");
          }
          return cb();
        };
      })(this));
    },
    calcClusterSize: function() {
      var cluster, i, len, ref, results;
      this.offsetHeight = this.$el.offsetHeight;
      this.clusterSize = Math.ceil(this.$el.offsetHeight / this.rowHeight * this.clusterSizeFac);
      if (this.rowsCount) {
        this.clustersCount = Math.ceil(this.rowsCount / this.clusterSize);
        this.updateLastRowHeight();
      }
      this.clusterHeight = this.rowHeight * this.clusterSize;
      ref = this.clusters;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        cluster = ref[i];
        results.push(cluster.height = this.clusterHeight);
      }
      return results;
    },
    updateLastRowHeight: function() {
      var newHeight;
      if (this.rowsCount && this.clusterSize) {
        newHeight = (this.rowsCount - (this.clusterVisible + this.clustersBelow + 1) * this.clusterSize) * this.rowHeight;
        if (newHeight > 0) {
          return this.lastRowHeight = newHeight;
        } else {
          return this.lastRowHeight = 0;
        }
      }
    },
    processScroll: function(top) {
      this.clusterVisible = Math.floor(top / this.clusterHeight + 0.5);
      if (this.clusterVisibleLast !== this.clusterVisible) {
        this.processClusterChange(top);
        return this.clusterVisibleLast = this.clusterVisible;
      }
    },
    processClusterChange: function(top, repaint) {
      var absI, absIs, down, i, j, k, len, position, ref, ref1, relI, results, results1;
      if (top == null) {
        top = this.$el.scrollTop;
      }
      if (repaint == null) {
        repaint = false;
      }
      down = this.clusterVisibleLast < this.clusterVisible;
      if (this.clusterVisible === 0) {
        this.clustersBelow = 2;
      } else if (this.clusterVisible === this.clustersCount - 1) {
        this.clustersBelow = 0;
      } else {
        this.clustersBelow = 1;
      }
      position = this.clusterVisible + this.clustersBelow;
      if (down) {
        absIs = (function() {
          results = [];
          for (var i = ref = position - 2; ref <= position ? i <= position : i >= position; ref <= position ? i++ : i--){ results.push(i); }
          return results;
        }).apply(this);
      } else {
        absIs = (function() {
          results1 = [];
          for (var j = position, ref1 = position - 2; position <= ref1 ? j <= ref1 : j >= ref1; position <= ref1 ? j++ : j--){ results1.push(j); }
          return results1;
        }).apply(this);
      }
      for (k = 0, len = absIs.length; k < len; k++) {
        absI = absIs[k];
        relI = absI % 3;
        if (this.clusters[relI].nr !== absI || repaint) {
          if (down) {
            this.clusters[relI].$before(this.$els.lastRow);
          } else {
            this.clusters[relI].$after(this.$els.firstRow);
          }
          this.clusters[relI].nr = absI;
          this.fillClusterWithData(this.clusters[relI], absI * this.clusterSize, (absI + 1) * this.clusterSize - 1);
        }
      }
      this.updateFirstRowHeight();
      return this.updateLastRowHeight();
    },
    fillClusterWithData: function(cluster, first, last) {
      var loading;
      if (this.state.loading) {
        this.state.loading = false;
        this.$emit("clusterize-loaded");
      }
      cluster.loading += 1;
      loading = cluster.loading;
      this.$emit("cluster-loading", cluster.nr);
      return this.getData(first, last, (function(_this) {
        return function(data) {
          if (cluster.loading === loading) {
            if (data.length !== _this.clusterSize) {
              cluster.height = data.length * _this.rowHeight;
            } else {
              cluster.height = _this.clusterHeight;
            }
            cluster.data = data;
            cluster.loading = 0;
            return _this.$emit("cluster-loaded", cluster.nr);
          }
        };
      })(this));
    },
    updateFirstRowHeight: function() {
      var newHeight;
      newHeight = (this.clusterVisible - (2 - this.clustersBelow)) * this.clusterHeight;
      if (newHeight > 0) {
        return this.firstRowHeight = newHeight;
      } else {
        return this.firstRowHeight = 0;
      }
    },
    onScroll: function(e) {
      var top;
      top = this.$el.scrollTop;
      this.$emit("scroll-y", top);
      this.$emit("scroll-x", this.$el.scrollLeft);
      if (this.lastScrollTop !== top) {
        this.lastScrollTop = top;
        return this.processScroll(top);
      }
    },
    processData: function(newData, oldData) {
      if (newData !== oldData) {
        return this.getAndProcessDataCount();
      }
    },
    redraw: function() {
      return this.processClusterChange(this.$el.scrollTop, true);
    },
    processTemplate: function() {
      var cluster, factory, i, len, ref, results;
      if (this.state.started) {
        if (!this.template) {
          this.template = this.fragToString(this._slotContents["default"]);
        }
        factory = new this.Vue.FragmentFactory(this.parentVm, this.template);
        ref = this.clusters;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          cluster = ref[i];
          results.push(cluster.factory = factory);
        }
        return results;
      }
    }
  },
  ready: function() {
    var child, i, len, ref;
    ref = this.$children;
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      if (child.isCluster) {
        this.clusters.push(child);
      }
      if (child.isRow) {
        this.rowObj = child;
      }
    }
    if (!this.manualStart) {
      return this.start();
    }
  },
  watch: {
    "height": "updateHeight",
    "scrollTop": function(val) {
      if (val !== this.$el.scrollTop) {
        this.$el.scrollTop = val;
        return this.processScroll(val);
      }
    },
    "template": "processTemplate",
    "rowWatchers": function(val) {
      if (val.height == null) {
        val.height = {
          vm: this,
          prop: "rowHeight"
        };
      }
      return val;
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div class=clusterize :style=computedStyle :class=\"{'loading':state.loading, 'not-started':!state.started}\" @scroll=onScroll><div class=clusterize-first-row v-el:first-row=v-el:first-row v-bind:style=\"{height:firstRowHeight+'px'}\"></div><clusterize-cluster v-bind:binding-name=bindingName v-bind:row-watchers=rowWatchers v-bind:parent-vm=parentVm><slot name=loading></slot></clusterize-cluster><clusterize-cluster v-bind:binding-name=bindingName v-bind:row-watchers=rowWatchers v-bind:parent-vm=parentVm><slot name=loading></slot></clusterize-cluster><clusterize-cluster v-bind:binding-name=bindingName v-bind:row-watchers=rowWatchers v-bind:parent-vm=parentVm><slot name=loading></slot></clusterize-cluster><div class=clusterize-last-row v-el:last-row=v-el:last-row v-bind:style=\"{height:lastRowHeight+'px'}\"></div></div>"
