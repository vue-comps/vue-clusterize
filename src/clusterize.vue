// out: ..
<template lang="jade">
.clusterize(
  v-bind:class="{'scroll-bar-x':scrollBars.x, 'scroll-bar-y':scrollBars.y, 'auto-height':autoHeight}"
  @mouseenter="onHover"
  @mouseleave="onHover"
  @scroll="onScroll"
  )

  .clusterize-first-row(v-el:first-row v-bind:style="{height:firstRowHeight+'px'}")
  clusterize-cluster(v-bind:row-height="rowHeight" v-bind:bindingName="bindingName")
    slot(name="loading")
  clusterize-cluster(v-bind:row-height="rowHeight" v-bind:bindingName="bindingName")
    slot(name="loading")
  clusterize-cluster(v-bind:row-height="rowHeight" v-bind:bindingName="bindingName")
    slot(name="loading")
  clusterize-cluster(v-bind:row-height="rowHeight" v-bind:bindingName="bindingName")
    slot(name="loading")
  .clusterize-last-row(v-el:last-row v-bind:style="{height:lastRowHeight+'px'}")
  div(style="display:none")
    slot
</template>

<script lang="coffee">
module.exports =
  mixins: [
    require "vue-mixins/onResize"
  ]
  components:
    "clusterize-cluster": require "./clusterize-cluster"
  props:
    "bindingName":
      type: String
      default: "data"
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
      default: -> []
    "dataGetter":
      type: Function
    "rowCounter":
      type: Function
    "scrollPosition":
      type: Object
      default: -> left: -1, top: -1
  data: ->
    clusters: []
    rowObj: null
    firstRowHeight: null
    lastRowHeight: null
    rowCount: @data.length
    rowHeight: -1
    rowsCount: -1
    clustersCount: -1
    clusterHeight: null
    clusterSize: 25
    clustersBelow: 3
    clusterVisible: 0
    clusterVisibleLast: -1
    offsetHeight: 0
    minHeight: null
    disposeResizeCb: null
    scrollBarSize:
      height: 0
      width: 0
  methods:
    calcRowHeight: (dataSet,cb) ->
      @clusters[0].data = [dataSet]
      @$nextTick => @$nextTick =>
        @rowHeight = @clusters[0].$el.offsetHeight
        throw new Error "height of row is 0" if @rowHeight == 0
        @calcClusterSize()
        cb()
    calcClusterSize: ->
      @offsetHeight = @$el.offsetHeight
      @clusterSize = Math.ceil(@$el.offsetHeight/@rowHeight)
      if @rowsCount
        @clustersCount = Math.ceil(@rowsCount/@clusterSize)
        @updateLastRowHeight()
      @clusterHeight = @rowHeight*@clusterSize

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
    processScroll: (top) ->
      if top < 0 # first render
        @$nextTick =>
          top = @$el.scrollTop
          if top == 0
            @clusterVisible = 0
          else
            @clusterVisible = Math.floor(top/@clusterHeight)
          @processClusterChange(top)
      else
        if top == 0
          @clusterVisible = 0
        else
          @clusterVisible = Math.floor(top/@clusterHeight)
        if @clusterVisibleLast != @clusterVisible
          @processClusterChange(top)
          @clusterVisibleLast = @clusterVisible
    getData: (first,last,cb) ->
      if @dataGetter?
        result = @dataGetter(first,last,cb)
        result.then(cb) if result.then?

      else
        cb(@data[first..last])
    fillClusterWithData: (cluster,first,last) ->
      if @rowsCount > -1 and @rowsCount <= first
        cluster.data = []
      else
        cluster.loading += 1
        loading = cluster.loading
        @getData first, last, (data) =>
          if cluster.loading == loading
            cluster.data = data
            cluster.loading = 0
    processClusterChange: (top = @$el.scrollTop, repaint = false) ->
      down = @clusterVisibleLast < @clusterVisible # is scrolling down
      # calculating how many clusters will be below the currently visible
      if @clusterVisible == 0 # first
        @clustersBelow = 3
      else if @clusterVisible == 1 # second
        @clustersBelow = 2
      else if @clusterVisible == @clustersCount-2 # before last
        @clustersBelow = 1
      else if @clusterVisible == @clustersCount-1 # last
        @clustersBelow = 0
      else if down
        @clustersBelow = 2 # 2 below 1 atop
      else #scrolling up
        @clustersBelow = 1 # 1 below 2 atop
      position = @clusterVisible + @clustersBelow
      # calculate absolute numbers of visible clusters
      if down
        absIs = [position-3..position]
      else
        absIs = [position..position-3]
      for absI in absIs
        relI = absI%4
        if @clusters[relI].nr != absI or repaint# if position of cluster changed
          #m ove the cluster
          if down
            @clusters[relI].$before @$els.lastRow
          else
            @clusters[relI].$after @$els.firstRow
          @clusters[relI].nr = absI
          # change data of the moving cluster
          @fillClusterWithData @clusters[relI], absI*@clusterSize, (absI+1)*@clusterSize-1
      @updateFirstRowHeight()
      @updateLastRowHeight()
    updateFirstRowHeight: ->
      newHeight = (@clusterVisible-(3-@clustersBelow))*@clusterHeight
      if newHeight > 0
        @firstRowHeight = newHeight
      else
        @firstRowHeight = 0
    updateLastRowHeight: ->
      if @rowsCount
        newHeight = (@rowsCount-(@clusterVisible+@clustersBelow+1)*@clusterSize)*@rowHeight
        if newHeight > 0
          @lastRowHeight = newHeight
        else
          @lastRowHeight = 0
    getAndProcessDataCount: ->
      getDataCount = (cb) =>
        if @rowCounter
          result = @rowCounter(cb)
          result.then(cb) if result.then?
        else
          cb(@data.length)
      processDataCount = (count) =>
        if count > 0
          @rowsCount = count
          @clustersCount = Math.ceil(@rowsCount/@clusterSize)
          @updateLastRowHeight()
      getDataCount processDataCount
    start: ->
      if @data.length > 0
        @$watch("data", @processData) # watch data only if static
      @getData 0,0, (data) =>
        @getAndProcessDataCount()
        @calcRowHeight data[0], =>
          @processScroll(-1)
          @onHover()
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
    updateHeight: ->
      if @rowHeight > -1 and Math.abs(@offsetHeight-@$el.offsetHeight)> 0.5*@clusterHeight
        @$nextTick =>
          @calcClusterSize()
          @processClusterChange(@$el.scrollTop,true)
    redraw: ->
      @processClusterChange(@$el.scrollTop,true)
    processAutoHeight: ->
      if @autoHeight
        @disposeResizeCb = @addResizeCb @updateHeight unless @disposeResizeCb?
      else
        @disposeResizeCb?()
  compiled: ->
    for child in @$children
      if child.isCluster
        @clusters.push child
      if child.isRow
        @rowObj = child
    throw new Error "no clusterize-row was found" unless @rowObj?
    frag = @rowObj.$options.template
    frag = frag.replace(/<\/div>$/,@rowObj.$options._content.innerHTML+"</div>")
    factory = new @$root.constructor.FragmentFactory @$parent, frag
    for cluster in @clusters
      cluster.factory = factory
  ready: ->
    if @autoStart
      @start()
    @processAutoHeight()
  watch:
    "autoHeight": "processAutoHeight"
    "scrollPosition.top": "setScrollTop"
    "scrollPosition.left": "setScrollLeft"
    "position": "setPosition"
    "dataGetter": "redraw"
    "rowCounter" : "getAndProcessDataCount"
</script>
<style lang="stylus">
.clusterize
  overflow:hidden
  &.scroll-bar-x:hover
    overflow-x: auto
  &.scroll-bar-y:hover
    overflow-y: auto
.clusterize.auto-height
  position: absolute
  top 0
  bottom 0
  left 0
  right 0
</style>
