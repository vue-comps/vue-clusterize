var __vueify_style__ = require("vueify-insert-css").insert(".clusterize {\n  float: left;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n}\n.clusterize.scroll-bar-x:hover {\n  overflow-x: auto;\n}\n.clusterize.scroll-bar-y:hover {\n  overflow-y: auto;\n}\n")
module.exports = {
  components: {
    "clusterize-cluster": require("./clusterize-cluster")
  },
  props: {
    "width": {
      type: Number,
      "default": -1
    },
    "maxWidth": {
      type: Number,
      "default": -1
    },
    "height": {
      type: Number,
      "default": -1
    },
    "position": {
      type: Number,
      "default": 0
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
      firstRowHeight: null,
      lastRowHeight: null,
      rowCount: this.data.length,
      rowHeight: -1,
      rowsCount: -1,
      clustersCount: -1,
      clusterHeight: null,
      clusterSize: 25,
      clusters: [],
      clustersBelow: 3,
      clusterVisible: 0,
      clusterVisibleLast: -1,
      minHeight: null,
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
            console.log(_this);
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
    setPosition: function(pos) {
      if (pos == null) {
        pos = this.position;
      }
      if (pos > -1 && this.rowHeight > -1) {
        this.setScrollPosition.top = this.rowHeight * this.position;
        return true;
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
        this.setPosition();
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
      if (this.dataGetter != null) {
        return this.dataGetter(first, last).then(cb);
      } else {
        return cb(this.data.slice(first, +last + 1 || 9e9));
      }
    },
    fillClusterWithData: function(cluster, first, last) {
      if (this.rowsCount > -1 && this.rowsCount <= first) {
        return cluster.data = [];
      } else {
        return this.getData(first, last, (function(_this) {
          return function(data) {
            return cluster.data = data;
          };
        })(this));
      }
    },
    processClusterChange: function(top) {
      var absI, absIs, down, i, j, k, len, position, ref, ref1, relI, results, results1;
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
        if (this.clusters[relI].nr !== absI) {
          if (down) {
            this.clusters[relI].$before(this.$els.lastRow);
          } else {
            this.clusters[relI].$after(this.$els.firstRow);
          }
          this.clusters[relI].nr = absI;
          this.fillClusterWithData(this.clusters[relI], absI * this.clusterSize, (absI + 1) * this.clusterSize);
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
          if (_this.rowCounter) {
            return _this.rowCounter().then(cb);
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
        this.setPosition = 0;
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
    updateHeight: function(height, oldHeight) {
      if (this.rowHeight > -1 && Math.abs(oldHeight - height) > 0.8 * height) {
        return this.$nextTick(this.calcClusterSize);
      }
    },
    updateMaxWidth: function(width) {
      if (width == null) {
        width = this.maxWidth;
      }
      return this.style["max-width"] = width + "px";
    }
  },
  compiled: function() {
    var cluster, i, len, ref, results;
    ref = this.$children;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      cluster = ref[i];
      if (cluster.isCluster) {
        results.push(this.clusters.push(cluster));
      } else {
        results.push(void 0);
      }
    }
    return results;
  },
  ready: function() {
    if (this.autoStart) {
      return this.start();
    }
  },
  watch: {
    "height": "updateHeight",
    "scrollPosition.top": "setScrollTop",
    "scrollPosition.left": "setScrollLeft",
    "position": "setPosition"
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div v-bind:style=\"{width:width+'px', height:height+'px', max-width:maxWidth+'px'}\" v-bind:class=\"{'scroll-bar-x':scrollBars.x, 'scroll-bar-y':scrollBars.y}\" @mouseenter=\"onHover\" @mouseleave=\"onHover\" @scroll=\"onScroll\" class=\"clusterize\"><div v-el:first-row=\"v-el:first-row\" v-bind:style=\"{height:firstRowHeight+'px'}\" class=\"clusterize-first-row\"></div><clusterize-cluster v-for=\"cluster in 4\" v-bind:row-height=\"rowHeight\"><slot :data=\"test\" v-for=\"test in 2\"></slot></clusterize-cluster><div v-el:last-row=\"v-el:last-row\" v-bind:style=\"{height:lastRowHeight+'px'}\" class=\"clusterize-last-row\"></div></div>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  var id = "/home/peaul"
  module.hot.dispose(function () {
    require("vueify-insert-css").cache[".clusterize {\n  float: left;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n}\n.clusterize.scroll-bar-x:hover {\n  overflow-x: auto;\n}\n.clusterize.scroll-bar-y:hover {\n  overflow-y: auto;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord(id, module.exports)
  } else {
    hotAPI.update(id, module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}