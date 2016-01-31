// out: ..
<template lang="jade">
.clusterize(
  v-bind:style="{width:width+'px', height:height+'px', max-width:maxWidth+'px'}"
  v-bind:class="{'scroll-bar-x':scrollBars.x, 'scroll-bar-y':scrollBars.y}"
  @mouseenter="onHover"
  @mouseleave="onHover"
  @scroll="onScroll"
  )

  .clusterize-first-row(v-el:first-row v-bind:style="{height:firstRowHeight+'px'}")
  clusterize-cluster(v-for="cluster in 4" v-bind:row-height="rowHeight")
    slot(:data="test" v-for="test in 2")
  .clusterize-last-row(v-el:last-row v-bind:style="{height:lastRowHeight+'px'}")
</template>

<script lang="coffee">
module.exports =
  components:
    "clusterize-cluster": require "./clusterize-cluster"
  props:
    "width":
      type: Number
      default: -1
    "maxWidth":
      type: Number
      default: -1
    "height":
      type: Number
      default: -1
    "position":
      type: Number
      default: 0
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
    firstRowHeight: null
    lastRowHeight: null
    rowCount: @data.length
    rowHeight: -1
    rowsCount: -1
    clustersCount: -1
    clusterHeight: null
    clusterSize: 25
    clusters: []
    clustersBelow: 3
    clusterVisible: 0
    clusterVisibleLast: -1
    minHeight: null
    scrollBarSize:
      height: 0
      width: 0
  methods:
    calcRowHeight: (dataSet,cb) ->
      @clusters[0].data = [dataSet]
      @$nextTick => @$nextTick =>
        console.log @
        @rowHeight = @clusters[0].$el.offsetHeight
        throw new Error "height of row is 0" if @rowHeight == 0
        @calcClusterSize()
        cb()
    calcClusterSize: ->
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
    setPosition: (pos=@position) ->
      if pos > -1 && @rowHeight > -1
        @setScrollPosition.top = @rowHeight*@position
        return true
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
        @setPosition()
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
        @dataGetter(first,last).then cb
      else
        cb(@data[first..last])
    fillClusterWithData: (cluster,first,last) ->
      if @rowsCount > -1 and @rowsCount <= first
        cluster.data = []
      else
        @getData first, last, (data) =>
          cluster.data = data
    processClusterChange: (top) ->
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
        if @clusters[relI].nr != absI # if position of cluster changed
          #m ove the cluster
          if down
            @clusters[relI].$before @$els.lastRow
          else
            @clusters[relI].$after @$els.firstRow
          @clusters[relI].nr = absI
          # change data of the moving cluster
          @fillClusterWithData @clusters[relI], absI*@clusterSize, (absI+1)*@clusterSize
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
          @rowCounter().then cb
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
        @setPosition = 0
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
    updateHeight: (height, oldHeight) ->
      if @rowHeight > -1 and Math.abs(oldHeight-height)> 0.8*height
        @$nextTick @calcClusterSize
    updateMaxWidth: (width=@maxWidth) ->
      @style["max-width"] = width+"px"
  compiled: ->
    for cluster in @$children
      if cluster.isCluster
        @clusters.push cluster
  ready: ->
    if @autoStart
      @start()
  watch:
    "height": "updateHeight"
    "scrollPosition.top": "setScrollTop"
    "scrollPosition.left": "setScrollLeft"
    "position": "setPosition"
</script>
<style lang="stylus">

.clusterize
  float:left
  height: 100%
  width: 100%
  overflow:hidden
  &.scroll-bar-x:hover
    overflow-x: auto
  &.scroll-bar-y:hover
    overflow-y: auto
</style>
