var __vueify_style__ = require("vueify-insert-css").insert(".clusterize {\n  overflow: hidden;\n}\n.clusterize.scroll-bar-x:hover {\n  overflow-x: auto;\n}\n.clusterize.scroll-bar-y:hover {\n  overflow-y: auto;\n}\n.clusterize.auto-height {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n")
module.exports = {
  mixins: [require("vue-mixins/onResize")],
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
      type: Array,
      "default": function() {
        return [];
      }
    },
    "dataGetter": {
      type: Function
    },
    "rowCounter": {
      type: Function
    },
    "scrollPosition": {
      type: Object,
      "default": function() {
        return {
          left: -1,
          top: -1
        };
      }
    }
  },
  data: function() {
    return {
      clusters: [],
      rowObj: null,
      firstRowHeight: null,
      lastRowHeight: null,
      rowCount: this.data.length,
      rowHeight: -1,
      rowsCount: -1,
      clustersCount: -1,
      clusterHeight: null,
      clusterSize: 25,
      clustersBelow: 3,
      clusterVisible: 0,
      clusterVisibleLast: -1,
      offsetHeight: 0,
      minHeight: null,
      disposeResizeCb: null,
      scrollBarSize: {
        height: 0,
        width: 0
      }
    };
  },
  methods: {
    calcRowHeight: function(dataSet, cb) {
      this.clusters[0].data = [dataSet];
      return this.$nextTick((function(_this) {
        return function() {
          return _this.$nextTick(function() {
            _this.rowHeight = _this.clusters[0].$el.offsetHeight;
            if (_this.rowHeight === 0) {
              throw new Error("height of row is 0");
            }
            _this.calcClusterSize();
            return cb();
          });
        };
      })(this));
    },
    calcClusterSize: function() {
      this.offsetHeight = this.$el.offsetHeight;
      this.clusterSize = Math.ceil(this.$el.offsetHeight / this.rowHeight);
      if (this.rowsCount) {
        this.clustersCount = Math.ceil(this.rowsCount / this.clusterSize);
        this.updateLastRowHeight();
      }
      return this.clusterHeight = this.rowHeight * this.clusterSize;
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
    processScroll: function(top) {
      if (top < 0) {
        return this.$nextTick((function(_this) {
          return function() {
            top = _this.$el.scrollTop;
            if (top === 0) {
              _this.clusterVisible = 0;
            } else {
              _this.clusterVisible = Math.floor(top / _this.clusterHeight);
            }
            return _this.processClusterChange(top);
          };
        })(this));
      } else {
        if (top === 0) {
          this.clusterVisible = 0;
        } else {
          this.clusterVisible = Math.floor(top / this.clusterHeight);
        }
        if (this.clusterVisibleLast !== this.clusterVisible) {
          this.processClusterChange(top);
          return this.clusterVisibleLast = this.clusterVisible;
        }
      }
    },
    getData: function(first, last, cb) {
      var result;
      if (this.dataGetter != null) {
        result = this.dataGetter(first, last, cb);
        if (result.then != null) {
          return result.then(cb);
        }
      } else {
        return cb(this.data.slice(first, +last + 1 || 9e9));
      }
    },
    fillClusterWithData: function(cluster, first, last) {
      var loading;
      if (this.rowsCount > -1 && this.rowsCount <= first) {
        return cluster.data = [];
      } else {
        cluster.loading += 1;
        loading = cluster.loading;
        return this.getData(first, last, (function(_this) {
          return function(data) {
            if (cluster.loading === loading) {
              cluster.data = data;
              return cluster.loading = 0;
            }
          };
        })(this));
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
        this.clustersBelow = 3;
      } else if (this.clusterVisible === 1) {
        this.clustersBelow = 2;
      } else if (this.clusterVisible === this.clustersCount - 2) {
        this.clustersBelow = 1;
      } else if (this.clusterVisible === this.clustersCount - 1) {
        this.clustersBelow = 0;
      } else if (down) {
        this.clustersBelow = 2;
      } else {
        this.clustersBelow = 1;
      }
      position = this.clusterVisible + this.clustersBelow;
      if (down) {
        absIs = (function() {
          results = [];
          for (var i = ref = position - 3; ref <= position ? i <= position : i >= position; ref <= position ? i++ : i--){ results.push(i); }
          return results;
        }).apply(this);
      } else {
        absIs = (function() {
          results1 = [];
          for (var j = position, ref1 = position - 3; position <= ref1 ? j <= ref1 : j >= ref1; position <= ref1 ? j++ : j--){ results1.push(j); }
          return results1;
        }).apply(this);
      }
      for (k = 0, len = absIs.length; k < len; k++) {
        absI = absIs[k];
        relI = absI % 4;
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
    updateFirstRowHeight: function() {
      var newHeight;
      newHeight = (this.clusterVisible - (3 - this.clustersBelow)) * this.clusterHeight;
      if (newHeight > 0) {
        return this.firstRowHeight = newHeight;
      } else {
        return this.firstRowHeight = 0;
      }
    },
    updateLastRowHeight: function() {
      var newHeight;
      if (this.rowsCount) {
        newHeight = (this.rowsCount - (this.clusterVisible + this.clustersBelow + 1) * this.clusterSize) * this.rowHeight;
        if (newHeight > 0) {
          return this.lastRowHeight = newHeight;
        } else {
          return this.lastRowHeight = 0;
        }
      }
    },
    getAndProcessDataCount: function() {
      var getDataCount, processDataCount;
      getDataCount = (function(_this) {
        return function(cb) {
          var result;
          if (_this.rowCounter) {
            result = _this.rowCounter(cb);
            if (result.then != null) {
              return result.then(cb);
            }
          } else {
            return cb(_this.data.length);
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
    start: function() {
      if (this.data.length > 0) {
        this.$watch("data", this.processData);
      }
      return this.getData(0, 0, (function(_this) {
        return function(data) {
          _this.getAndProcessDataCount();
          return _this.calcRowHeight(data[0], function() {
            _this.processScroll(-1);
            return _this.onHover();
          });
        };
      })(this));
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
    updateHeight: function() {
      if (this.rowHeight > -1 && Math.abs(this.offsetHeight - this.$el.offsetHeight) > 0.5 * this.clusterHeight) {
        return this.$nextTick((function(_this) {
          return function() {
            _this.calcClusterSize();
            return _this.processClusterChange(_this.$el.scrollTop, true);
          };
        })(this));
      }
    },
    redraw: function() {
      return this.processClusterChange(this.$el.scrollTop, true);
    },
    processAutoHeight: function() {
      if (this.autoHeight) {
        if (this.disposeResizeCb == null) {
          return this.disposeResizeCb = this.addResizeCb(this.updateHeight);
        }
      } else {
        return typeof this.disposeResizeCb === "function" ? this.disposeResizeCb() : void 0;
      }
    }
  },
  compiled: function() {
    var child, cluster, factory, frag, i, j, len, len1, ref, ref1, results;
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
    frag = frag.replace(/<\/div>$/, this.rowObj.$options._content.innerHTML + "</div>");
    factory = new this.$root.constructor.FragmentFactory(this.$parent, frag);
    ref1 = this.clusters;
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      cluster = ref1[j];
      results.push(cluster.factory = factory);
    }
    return results;
  },
  ready: function() {
    if (this.autoStart) {
      this.start();
    }
    return this.processAutoHeight();
  },
  watch: {
    "height": "updateHeight",
    "autoHeight": "processAutoHeight",
    "scrollPosition.top": "setScrollTop",
    "scrollPosition.left": "setScrollLeft",
    "position": "setPosition",
    "dataGetter": "redraw",
    "rowCounter": "getAndProcessDataCount"
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div v-bind:style=\"{height:height+'px'}\" v-bind:class=\"{'scroll-bar-x':scrollBars.x, 'scroll-bar-y':scrollBars.y, 'auto-height':autoHeight}\" @mouseenter=\"onHover\" @mouseleave=\"onHover\" @scroll=\"onScroll\" class=\"clusterize\"><div v-el:first-row=\"v-el:first-row\" v-bind:style=\"{height:firstRowHeight+'px'}\" class=\"clusterize-first-row\"></div><clusterize-cluster v-bind:row-height=\"rowHeight\" v-bind:bindingName=\"bindingName\"><slot name=\"loading\"></slot></clusterize-cluster><clusterize-cluster v-bind:row-height=\"rowHeight\" v-bind:bindingName=\"bindingName\"><slot name=\"loading\"></slot></clusterize-cluster><clusterize-cluster v-bind:row-height=\"rowHeight\" v-bind:bindingName=\"bindingName\"><slot name=\"loading\"></slot></clusterize-cluster><clusterize-cluster v-bind:row-height=\"rowHeight\" v-bind:bindingName=\"bindingName\"><slot name=\"loading\"></slot></clusterize-cluster><div v-el:last-row=\"v-el:last-row\" v-bind:style=\"{height:lastRowHeight+'px'}\" class=\"clusterize-last-row\"></div><div style=\"display:none\"><slot></slot></div></div>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/home/peaul"
  module.hot.dispose(function () {
    require("vueify-insert-css").cache[".clusterize {\n  overflow: hidden;\n}\n.clusterize.scroll-bar-x:hover {\n  overflow-x: auto;\n}\n.clusterize.scroll-bar-y:hover {\n  overflow-y: auto;\n}\n.clusterize.auto-height {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}