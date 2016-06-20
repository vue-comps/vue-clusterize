// out: ..
<template lang="pug">
.clusterize(
  :style="computedStyle",
  :class="{'loading':state.loading, 'not-started':!state.started}",
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
</template>

<script lang="coffee">
module.exports =

  mixins: [
    require "vue-mixins/onElementResize"
    require "vue-mixins/vue"
    require "vue-mixins/fragToString"
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
    "manualStart":
      type: Boolean
      default: false
    "data":
      type: Array
    "scrollTop":
      type: Number
      default: 0
    "scrollLeft":
      type: Number
      default: 0
    "clusterSizeFac":
      type: Number
      default: 1.5
    "template":
      type: String
    "style":
      type: Object
    "rowWatchers":
      type: Object
      default: -> {height: {vm: @, prop:"rowHeight"}}
    "parentVm":
      type: Object
      default: -> @$parent

  computed:
    position: ->
      if @autoHeight
        @disposeResizeCb = @onElementResize @$el, @updateHeight unless @disposeResizeCb?
        return "absolute"
      else
        @disposeResizeCb?()
        return null
    computedStyle: ->
      return null unless @state.started
      style =
        height: @height+'px'
        position: @position
        top: if @autoHeight then 0 else null
        bottom: if @autoHeight then 0 else null
        overflow: "auto"
      if @style?
        for key,val of @style
          style[key] = val
      return style

  data: ->
    clusters: []
    rowObj: null
    firstRowHeight: null
    lastRowHeight: null
    rowCount: null
    rowHeight: null
    rowsCount: null
    clustersCount: null
    clusterHeight: null
    clusterSize: null
    clustersBelow: 2
    clusterVisible: 0
    clusterVisibleLast: -1
    offsetHeight: 0
    minHeight: null
    lastScrollTop: @scrollTop
    lastScrollLeft: @scrollLeft
    state:
      started: false
      startFinished: false
      loading: false

  methods:
    updateHeight: ->
      if @state.startFinished and @rowHeight > -1 and Math.abs(@offsetHeight-@$el.offsetHeight)/@clusterHeight*@clusterSizeFac > 0.2
        @calcClusterSize()
        @processClusterChange(@$el.scrollTop,true)

    start: (top = @$el.scrollTop) ->
      @state.started = true
      @processTemplate()
      @state.loading = true
      if @data?
        @$watch("data", @processData) # watch data only if static
      @getData 0,0, (data) =>
        @getAndProcessDataCount()
        @calcRowHeight data[0], =>
          @calcClusterSize()
          @processScroll(top)
          @state.startFinished = true

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

    calcRowHeight: (dataPiece,cb) ->
      @clusters[0].data = [dataPiece]
      @$nextTick =>
        @rowHeight = @clusters[0].$el.children[1].getBoundingClientRect().height
        throw new Error "height of row is 0" if @rowHeight == 0
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
      @$emit "scroll-y", top
      @$emit "scroll-x", @$el.scrollLeft
      if @lastScrollTop != top
        @lastScrollTop = top
        @processScroll(top)


    processData: (newData, oldData) ->
      if newData != oldData
        @getAndProcessDataCount()

    redraw: ->
      @processClusterChange(@$el.scrollTop,true)

    processTemplate: ->
      if @state.started
        unless @template
          @template = @fragToString(@_slotContents.default)
        factory = new @Vue.FragmentFactory @parentVm, @template
        for cluster in @clusters
          cluster.factory = factory

  ready: ->
    for child in @$children
      if child.isCluster
        @clusters.push child
      if child.isRow
        @rowObj = child
    unless @manualStart
      @start()

  watch:
    "height" : "updateHeight"
    "scrollTop": (val) ->
      if val != @$el.scrollTop
        @$el.scrollTop = val
        @processScroll(val)
    "template": "processTemplate"
    "rowWatchers": (val) ->
      val.height = {vm: @, prop:"rowHeight"} unless val.height?
      return val
</script>
