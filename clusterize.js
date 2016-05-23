module.exports = {
  mixins: [require("vue-mixins/onElementResize"), require("vue-mixins/vue")],
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
    "scrollBars": {
      type: Object,
      "default": function() {
        return {
          x: true,
          y: true
        };
      }
    },
    "autoStart": {
      type: Boolean,
      "default": true
    },
    "data": {
      type: Array
    },
    "scrollPosition": {
      type: Object,
      "default": function() {
        return {
          left: -1,
          top: -1
        };
      }
    },
    "clusterSizeFac": {
      type: Number,
      "default": 1.5
    },
    "rowHeight": {
      type: Number,
      "default": -1
    },
    "template": {
      type: String
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
    overflowX: function() {
      if (this.scrollBars.x) {
        return "auto";
      }
      return null;
    },
    overflowY: function() {
      if (this.scrollBars.y) {
        return "auto";
      }
      return null;
    },
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
    }
  },
  data: function() {
    return {
      clusters: [],
      rowObj: null,
      firstRowHeight: null,
      lastRowHeight: null,
      rowCount: null,
      rowsCount: null,
      clustersCount: null,
      clusterHeight: null,
      clusterSize: null,
      clustersBelow: 2,
      clusterVisible: 0,
      clusterVisibleLast: -1,
      offsetHeight: 0,
      minHeight: null,
      state: {
        started: false,
        loading: false
      },
      scrollBarSize: {
        height: 0,
        width: 0
      }
    };
  },
  ready: function() {
    var child, cluster, factory, frag, i, j, len, len1, ref, ref1;
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
    if (this.rowObj == null) {
      throw new Error("no clusterize-row was found");
    }
    frag = this.rowObj.$options.template;
    frag = frag.replace(/<\/div>$/, this._slotContents["default"].textContent + "</div>");
    factory = new this.Vue.FragmentFactory(this.$parent, frag);
    ref1 = this.clusters;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      cluster = ref1[j];
      cluster.factory = factory;
    }
    if (this.autoStart) {
      return this.start();
    }
  },
  methods: {
    updateHeight: function() {
      if (this.rowHeight > -1 && Math.abs(this.offsetHeight - this.$el.offsetHeight) / this.clusterHeight * this.clusterSizeFac > 0.2) {
        this.calcClusterSize();
        return this.processClusterChange(this.$el.scrollTop, true);
      }
    },
    start: function(top) {
      if (top == null) {
        top = this.$el.scrollTop;
      }
      this.state.started = true;
      this.state.loading = true;
      if (this.data != null) {
        this.$watch("data", this.processData);
      }
      return this.getData(0, 0, (function(_this) {
        return function(data) {
          _this.getAndProcessDataCount();
          if (_this.rowHeight === -1) {
            return _this.calcRowHeight(data[0], function() {
              _this.processScroll(top);
              return _this.onHover();
            });
          } else {
            _this.calcClusterSize();
            _this.processScroll(top);
            return _this.onHover();
          }
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
    calcRowHeight: function(dataSet, cb) {
      this.clusters[0].data = [dataSet];
      return this.$nextTick((function(_this) {
        return function() {
          _this.rowHeight = _this.clusters[0].$el.offsetHeight;
          if (_this.rowHeight === 0) {
            throw new Error("height of row is 0");
          }
          _this.calcClusterSize();
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
      var left, top;
      top = this.$el.scrollTop;
      left = this.$el.scrollLeft;
      if (this.scrollPosition.left !== left) {
        this.scrollPosition.left = left;
      }
      if (this.scrollPosition.top !== top) {
        this.scrollPosition.top = top;
        return this.processScroll(top);
      }
    },
    setScrollPosition: function() {
      this.setScrollTop(this.scrollPosition.top);
      return this.setScrollLeft(this.scrollPosition.left);
    },
    setScrollTop: function(top) {
      if (top > -1 && this.$el.scrollTop !== top) {
        this.$el.scrollTop = top;
        return this.processScroll(top);
      }
    },
    setScrollLeft: function(left) {
      if (left > -1 && this.$el.scrollLeft !== left) {
        return this.$el.scrollLeft = left;
      }
    },
    processData: function(newData, oldData) {
      if (newData !== oldData) {
        return this.getAndProcessDataCount();
      }
    },
    onHover: function() {
      if (this.scrollBars.y) {
        this.checkScrollBarWidth();
      }
      if (this.scrollBars.x) {
        return this.$nextTick(this.checkScrollBarHeight);
      }
    },
    checkScrollBarHeight: function() {
      return this.scrollBarSize.height = this.$el.offsetHeight - this.$el.clientHeight;
    },
    checkScrollBarWidth: function() {
      return this.scrollBarSize.width = this.$el.offsetWidth - this.$el.clientWidth;
    },
    redraw: function() {
      return this.processClusterChange(this.$el.scrollTop, true);
    }
  },
  watch: {
    "height": "updateHeight",
    "scrollPosition.top": "setScrollTop",
    "scrollPosition.left": "setScrollLeft",
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
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div :style=\"{height:height+'px',overflow:'hidden',overflowX:overflowX,overflowY:overflowY,position:position,top:autoHeight?0:null,bottom:autoHeight?0:null}\" :class=\"{'loading':state.loading, 'not-started':!state.started}\" @mouseenter=onHover @mouseleave=onHover @scroll=onScroll class=clusterize><div v-el:first-row=v-el:first-row v-bind:style=\"{height:firstRowHeight+'px'}\" class=clusterize-first-row></div><clusterize-cluster v-bind:binding-name=bindingName v-bind:row-watchers=rowWatchers v-bind:parent-vm=parentVm><slot name=loading></slot></clusterize-cluster><clusterize-cluster v-bind:binding-name=bindingName v-bind:row-watchers=rowWatchers v-bind:parent-vm=parentVm><slot name=loading></slot></clusterize-cluster><clusterize-cluster v-bind:binding-name=bindingName v-bind:row-watchers=rowWatchers v-bind:parent-vm=parentVm><slot name=loading></slot></clusterize-cluster><div v-el:last-row=v-el:last-row v-bind:style=\"{height:lastRowHeight+'px'}\" class=clusterize-last-row></div><div style=\"visibility: hidden; position:absolute\"><slot></slot></div></div>"
