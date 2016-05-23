// out: ..
<template lang="jade">
.clusterize(
  :style="{height:height+'px',overflow:'hidden',overflowX:overflowX,overflowY:overflowY,position:position,top:autoHeight?0:null,bottom:autoHeight?0:null}",
  :class="{'loading':state.loading, 'not-started':!state.started}",
  @mouseenter="onHover",
  @mouseleave="onHover",
  @scroll="onScroll"
  )
  .clusterize-first-row(v-el:first-row v-bind:style="{height:firstRowHeight+'px'}")
  clusterize-cluster(v-bind:binding-name="bindingName" v-bind:row-watchers="rowWatchers" v-bind:parent-vm="parentVm")
    slot(name="loading")
  clusterize-cluster(v-bind:binding-name="bindingName" v-bind:row-watchers="rowWatchers" v-bind:parent-vm="parentVm")
    slot(name="loading")
  clusterize-cluster(v-bind:binding-name="bindingName" v-bind:row-watchers="rowWatchers" v-bind:parent-vm="parentVm")
    slot(name="loading")
  .clusterize-last-row(v-el:last-row v-bind:style="{height:lastRowHeight+'px'}")
  div(style="visibility: hidden; position:absolute;")
    slot
</template>

<script lang="coffee">
module.exports =

  mixins: [
    require "vue-mixins/onElementResize"
    require "vue-mixins/vue"
  ]

  components:
    "clusterize-cluster": require "./clusterize-cluster"

  props:
    "bindingName":
      type: String
      default: "data"
    "height":
      type: Number
    "autoHeight":
      type: Boolean
      default: false
    "scrollBars":
      type: Object
      default: -> x:true, y: true
    "autoStart":
      type: Boolean
      default: true
    "data":
      type: Array
    "scrollPosition":
      type: Object
      default: -> left: -1, top: -1
    "clusterSizeFac":
      type: Number
      default: 1.5
    "template":
      type: String
    "rowWatchers":
      type: Object
      default: -> {height: {vm: @, prop:"rowHeight"}}
    "parentVm":
      type: Object
      default: -> @$parent

  computed:
    overflowX: ->
      return "auto" if @scrollBars.x
      return null
    overflowY: ->
      return "auto" if @scrollBars.y
      return null
    position: ->
      if @autoHeight
        @disposeResizeCb = @onElementResize @$el, @updateHeight unless @disposeResizeCb?
        return "absolute"
      else
        @disposeResizeCb?()
        return null

  data: ->
    clusters: []
    rowObj: null
    firstRowHeight: null
    lastRowHeight: null
    rowCount: null
    rowHeight: -1
    rowsCount: null
    clustersCount: null
    clusterHeight: null
    clusterSize: null
    clustersBelow: 2
    clusterVisible: 0
    clusterVisibleLast: -1
    offsetHeight: 0
    minHeight: null
    state:
      started: false
      loading: false
    scrollBarSize:
      height: 0
      width: 0

  ready: ->
    for child in @$children
      if child.isCluster
        @clusters.push child
      if child.isRow
        @rowObj = child
    throw new Error "no clusterize-row was found" unless @rowObj?
    frag = @rowObj.$options.template
    frag = frag.replace(/<\/div>$/,@_slotContents.default.textContent+"</div>")
    factory = new @Vue.FragmentFactory @$parent, frag
    for cluster in @clusters
      cluster.factory = factory
    if @autoStart
      @start()

  methods:

    updateHeight: ->
      if @rowHeight > -1 and Math.abs(@offsetHeight-@$el.offsetHeight)/@clusterHeight*@clusterSizeFac > 0.2
        @calcClusterSize()
        @processClusterChange(@$el.scrollTop,true)

    start: (top = @$el.scrollTop) ->
      @state.started = true
      @state.loading = true
      if @data?
        @$watch("data", @processData) # watch data only if static
      @getData 0,0, (data) =>
        @getAndProcessDataCount()
        @calcRowHeight data[0], =>
          @processScroll(top)
          @onHover()

    getData: (first,last,cb) ->
      if @data?
        cb(@data[first..last])
      else
        @$emit("get-data",first,last,cb)


    getAndProcessDataCount: ->
      getDataCount = (cb) =>
        if @data?
          cb(@data.length)
        else
          @$emit("get-data-count",cb)
      processDataCount = (count) =>
        if count > 0
          @rowsCount = count
          @clustersCount = Math.ceil(@rowsCount/@clusterSize)
          @updateLastRowHeight()
      getDataCount processDataCount

    calcRowHeight: (dataSet,cb) ->
      @clusters[0].data = [dataSet]
      @$nextTick =>
        @rowHeight = @clusters[0].$el.offsetHeight
        throw new Error "height of row is 0" if @rowHeight == 0
        @calcClusterSize()
        cb()

    calcClusterSize: ->
      @offsetHeight = @$el.offsetHeight
      @clusterSize = Math.ceil(@$el.offsetHeight/@rowHeight*@clusterSizeFac)
      if @rowsCount
        @clustersCount = Math.ceil(@rowsCount/@clusterSize)
        @updateLastRowHeight()
      @clusterHeight = @rowHeight*@clusterSize
      for cluster in @clusters
        cluster.height = @clusterHeight

    updateLastRowHeight: ->
      if @rowsCount and @clusterSize
        newHeight = (@rowsCount-(@clusterVisible+@clustersBelow+1)*@clusterSize)*@rowHeight
        if newHeight > 0
          @lastRowHeight = newHeight
        else
          @lastRowHeight = 0

    processScroll: (top) ->
      @clusterVisible = Math.floor(top/@clusterHeight+0.5)
      if @clusterVisibleLast != @clusterVisible
        @processClusterChange(top)
        @clusterVisibleLast = @clusterVisible

    processClusterChange: (top = @$el.scrollTop, repaint = false) ->
      down = @clusterVisibleLast < @clusterVisible # is scrolling down
      # calculating how many clusters will be below the currently visible
      if @clusterVisible == 0 # first
        @clustersBelow = 2
      else if @clusterVisible == @clustersCount-1 # last
        @clustersBelow = 0
      else
        @clustersBelow = 1 #
      position = @clusterVisible + @clustersBelow
      # calculate absolute numbers of visible clusters
      if down
        absIs = [position-2..position]
      else
        absIs = [position..position-2]
      for absI in absIs
        relI = absI%3
        if @clusters[relI].nr != absI or repaint# if position of cluster changed
          # move the cluster
          if down
            @clusters[relI].$before @$els.lastRow
          else
            @clusters[relI].$after @$els.firstRow
          @clusters[relI].nr = absI
          # change data of the moving cluster
          @fillClusterWithData @clusters[relI], absI*@clusterSize, (absI+1)*@clusterSize-1
      @updateFirstRowHeight()
      @updateLastRowHeight()

    fillClusterWithData: (cluster,first,last) ->
      if @state.loading
        @state.loading = false
        @$emit "clusterize-loaded"
      cluster.loading += 1
      loading = cluster.loading
      @$emit "cluster-loading", cluster.nr
      @getData first, last, (data) =>
        if cluster.loading == loading
          if data.length != @clusterSize
            cluster.height = data.length * @rowHeight
          else
            cluster.height = @clusterHeight
          cluster.data = data
          cluster.loading = 0
          @$emit "cluster-loaded", cluster.nr

    updateFirstRowHeight: ->
      newHeight = (@clusterVisible-(2-@clustersBelow))*@clusterHeight
      if newHeight > 0
        @firstRowHeight = newHeight
      else
        @firstRowHeight = 0

    onScroll: (e) ->
      top = @$el.scrollTop
      left = @$el.scrollLeft
      if @scrollPosition.left != left
        @scrollPosition.left = left
      if @scrollPosition.top != top
        @scrollPosition.top = top
        @processScroll(top)

    setScrollPosition: ->
      @setScrollTop(@scrollPosition.top)
      @setScrollLeft(@scrollPosition.left)

    setScrollTop: (top) ->
      if top > -1 && @$el.scrollTop != top
        @$el.scrollTop = top
        @processScroll(top)

    setScrollLeft: (left) ->
      if left > -1 && @$el.scrollLeft != left
        @$el.scrollLeft = left


    processData: (newData, oldData) ->
      if newData != oldData
        @getAndProcessDataCount()

    onHover: ->
      if @scrollBars.y
        @checkScrollBarWidth()
      if @scrollBars.x
        @$nextTick @checkScrollBarHeight

    checkScrollBarHeight: ->
      @scrollBarSize.height = @$el.offsetHeight - @$el.clientHeight

    checkScrollBarWidth: ->
      @scrollBarSize.width = @$el.offsetWidth - @$el.clientWidth

    redraw: ->
      @processClusterChange(@$el.scrollTop,true)

  watch:
    "height" : "updateHeight"
    "scrollPosition.top": "setScrollTop"
    "scrollPosition.left": "setScrollLeft"
    "rowWatchers": (val) ->
      console.log val
      val.height = {vm: @, prop:"rowHeight"} unless val.height?
      return val
</script>
