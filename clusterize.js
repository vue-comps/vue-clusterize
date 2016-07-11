var modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

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
    "rowHeight": {
      type: Number
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
    },
    "flex": {
      type: Boolean,
      "default": false
    },
    "flexInitial": {
      type: Number,
      "default": 20
    },
    "flexFac": {
      type: Number,
      "default": 1
    }
  },
  computed: {
    position: function() {
      if (this.autoHeight) {
        if (this.disposeResizeCb == null) {
          this.disposeResizeCb = this.onElementResize(this.$el, this.updateHeight);
        }
        return "absolute";
      } else if (this.flex) {
        if (this.disposeResizeCb == null) {
          this.disposeResizeCb = this.onElementResize(this.$el, this.updateHeight);
        }
      } else {
        if (typeof this.disposeResizeCb === "function") {
          this.disposeResizeCb();
        }
      }
      return null;
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
        left: this.autoHeight ? 0 : null,
        right: this.autoHeight ? 0 : null,
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
      firstRowHeight: null,
      lastRowHeight: null,
      rowCount: null,
      rowsCount: null,
      itemsPerRow: 1,
      clustersCount: null,
      clusterHeight: null,
      clusterSize: null,
      clustersBelow: 2,
      clusterVisible: 0,
      clusterVisibleLast: -1,
      offsetHeight: 0,
      itemWidth: 0,
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
      var changedHeight, changedWidth, process;
      process = (function(_this) {
        return function() {
          var data, l, len, oldData, ref, tmp;
          if (_this.flex) {
            oldData = _this.clusters[0].data;
            tmp = [];
            ref = _this.clusters[0].data;
            for (l = 0, len = ref.length; l < len; l++) {
              data = ref[l];
              tmp = tmp.concat(data);
              if (tmp.length >= _this.flexInitial) {
                break;
              }
            }
            _this.clusters[0].data = [tmp];
            return _this.$nextTick(function() {
              _this.calcRowHeight();
              return _this.processClusterChange(_this.$el.scrollTop, true);
            });
          } else {
            _this.calcClusterSize();
            return _this.processClusterChange(_this.$el.scrollTop, true);
          }
        };
      })(this);
      if (this.state.startFinished && this.rowHeight > -1) {
        changedHeight = Math.abs(this.offsetHeight - this.$el.offsetHeight) / this.clusterHeight * this.clusterSizeFac > 0.2;
        if (this.flex) {
          changedWidth = this.$el.clientWidth - this.itemsPerRow * this.itemWidth;
          if (changedWidth > this.itemWidth || changedWidth < 1) {
            return process();
          }
        } else if (changedHeight) {
          return process();
        }
      }
    },
    start: function(top) {
      var count;
      if (top == null) {
        top = this.$el.scrollTop;
      }
      this.state.started = true;
      this.processTemplate();
      this.state.loading = true;
      if (this.data != null) {
        this.$watch("data", this.processData);
      }
      count = 0;
      if (this.flex) {
        count = this.flexInitial;
      }
      if (!this.rowHeight) {
        return this.getData(0, count, (function(_this) {
          return function(data) {
            _this.getAndProcessDataCount();
            _this.clusters[0].index = 0;
            if (_this.flex) {
              _this.clusters[0].data = [data];
            } else {
              _this.clusters[0].data = data;
            }
            return _this.$nextTick(function() {
              _this.calcRowHeight();
              _this.processScroll(top);
              return _this.state.startFinished = true;
            });
          };
        })(this));
      } else {
        this.getAndProcessDataCount();
        return this.$nextTick((function(_this) {
          return function() {
            _this.calcClusterSize();
            _this.processScroll(top);
            return _this.state.startFinished = true;
          };
        })(this));
      }
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
            _this.dataCount = count;
            _this.clustersCount = Math.ceil(_this.dataCount / _this.itemsPerRow / _this.clusterSize);
            return _this.updateLastRowHeight();
          }
        };
      })(this);
      return getDataCount(processDataCount);
    },
    calcRowHeight: function() {
      var child, el, height, i, items, itemsPerRow, itemsPerRowLast, j, k, l, lastTop, maxHeights, rect, ref, row, style, width;
      if (this.flex) {
        maxHeights = [0];
        el = this.clusters[0].$el;
        lastTop = Number.MIN_VALUE;
        itemsPerRow = [];
        itemsPerRowLast = 0;
        row = el.children[1];
        items = row.children.length - 1;
        width = 0;
        k = 0;
        for (i = l = 1, ref = items; 1 <= ref ? l <= ref : l >= ref; i = 1 <= ref ? ++l : --l) {
          child = row.children[i];
          rect = child.getBoundingClientRect();
          style = window.getComputedStyle(child);
          height = rect.height + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
          width += rect.width;
          if (rect.top > lastTop + maxHeights[k] * 1 / 3 && i > 1) {
            j = i - 1;
            k++;
            itemsPerRow.push(j - itemsPerRowLast);
            itemsPerRowLast = j;
            lastTop = rect.top;
            maxHeights.push(height);
          } else {
            if (lastTop < rect.top) {
              lastTop = rect.top;
            }
            if (maxHeights[maxHeights.length - 1] < height) {
              maxHeights[maxHeights.length - 1] = height;
            }
          }
        }
        itemsPerRow.shift();
        maxHeights.shift();
        if (itemsPerRow.length > 0) {
          this.itemsPerRow = Math.floor(itemsPerRow.reduce(function(a, b) {
            return a + b;
          }) / itemsPerRow.length * this.flexFac);
        } else {
          this.itemsPerRow = items;
        }
        this.itemWidth = width / items;
        if (maxHeights.length > 0) {
          this.rowHeight = maxHeights.reduce(function(a, b) {
            return a + b;
          }) / maxHeights.length;
        } else {
          this.rowHeight = height;
        }
      } else {
        this.rowHeight = this.clusters[0].$el.children[1].getBoundingClientRect().height;
      }
      return this.calcClusterSize();
    },
    calcClusterSize: function() {
      var cluster, l, len, ref, results;
      this.offsetHeight = this.$el.offsetHeight;
      this.clusterSize = Math.ceil(this.$el.offsetHeight / this.rowHeight * this.clusterSizeFac) * this.itemsPerRow;
      if (this.dataCount) {
        this.clustersCount = Math.ceil(this.dataCount / this.itemsPerRow / this.clusterSize);
        if (this.clustersCount < 3) {
          this.clustersCount = 3;
        }
        this.updateLastRowHeight();
      }
      this.clusterHeight = this.rowHeight * this.clusterSize / this.itemsPerRow;
      ref = this.clusters;
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        cluster = ref[l];
        results.push(cluster.height = this.clusterHeight);
      }
      return results;
    },
    updateLastRowHeight: function() {
      var newHeight;
      if (this.dataCount && this.clusterSize) {
        newHeight = (this.dataCount - (this.clusterVisible + this.clustersBelow + 1) * this.clusterSize) * this.rowHeight / this.itemsPerRow;
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
      var absI, absIs, down, l, len, m, n, position, ref, ref1, relI, results, results1;
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
          for (var l = ref = position - 2; ref <= position ? l <= position : l >= position; ref <= position ? l++ : l--){ results.push(l); }
          return results;
        }).apply(this);
      } else {
        absIs = (function() {
          results1 = [];
          for (var m = position, ref1 = position - 2; position <= ref1 ? m <= ref1 : m >= ref1; position <= ref1 ? m++ : m--){ results1.push(m); }
          return results1;
        }).apply(this);
      }
      for (n = 0, len = absIs.length; n < len; n++) {
        absI = absIs[n];
        relI = absI % 3;
        if (this.clusters[relI].nr !== absI || repaint) {
          if (down) {
            this.clusters[relI].$before(this.$els.lastRow);
          } else {
            this.clusters[relI].$after(this.$els.firstRow);
          }
          this.clusters[relI].nr = absI;
          this.clusters[relI].index = absI * this.clusterSize;
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
          var currentData, d, data2, i, l, len;
          if (cluster.loading === loading) {
            if (data.length !== _this.clusterSize) {
              cluster.height = data.length * _this.rowHeight / _this.itemsPerRow;
            } else {
              cluster.height = _this.clusterHeight;
            }
            if (_this.flex) {
              data2 = [];
              currentData = [];
              for (i = l = 0, len = data.length; l < len; i = ++l) {
                d = data[i];
                if (modulo(i, _this.itemsPerRow) === 0) {
                  currentData = [];
                  data2.push(currentData);
                }
                currentData.push(d);
              }
              cluster.data = data2;
            } else {
              cluster.data = data;
            }
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
        return this.redraw();
      }
    },
    redraw: function() {
      this.getAndProcessDataCount();
      return this.processClusterChange(this.$el.scrollTop, true);
    },
    processTemplate: function() {
      var cluster, factory, l, len, ref, results;
      if (this.state.started) {
        if (!this.template) {
          this.template = this.fragToString(this._slotContents["default"]);
        }
        factory = new this.Vue.FragmentFactory(this.parentVm, this.template);
        ref = this.clusters;
        results = [];
        for (l = 0, len = ref.length; l < len; l++) {
          cluster = ref[l];
          results.push(cluster.factory = factory);
        }
        return results;
      }
    }
  },
  ready: function() {
    var child, l, len, ref;
    ref = this.$children;
    for (l = 0, len = ref.length; l < len; l++) {
      child = ref[l];
      if (child.isCluster) {
        this.clusters.push(child);
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
