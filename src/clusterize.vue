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
    "flex":
      type: Boolean
      default: false
    "flexInitial":
      type: Number
      default: 20
    "flexFac":
      type: Number
      default: 1

  computed:
    position: ->
      if @autoHeight
        @disposeResizeCb = @onElementResize @$el, @updateHeight unless @disposeResizeCb?
        return "absolute"
      else if @flex
        @disposeResizeCb = @onElementResize @$el, @updateHeight unless @disposeResizeCb?
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
        left: if @autoHeight then 0 else null
        right: if @autoHeight then 0 else null
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
    itemsPerRow: 1
    clustersCount: null
    clusterHeight: null
    clusterSize: null
    clustersBelow: 2
    clusterVisible: 0
    clusterVisibleLast: -1
    offsetHeight: 0
    itemWidth: 0
    minHeight: null
    lastScrollTop: @scrollTop
    lastScrollLeft: @scrollLeft
    state:
      started: false
      startFinished: false
      loading: false

  methods:
    updateHeight: ->
      process = =>
        if @flex
          oldData = @clusters[0].data
          tmp = []
          for data in @clusters[0].data
            tmp = tmp.concat data
            break if tmp.length >= @flexInitial
          @clusters[0].data = [tmp]
          @$nextTick =>
            @calcRowHeight()
            @processClusterChange(@$el.scrollTop,true)
        else
          @calcClusterSize()
          @processClusterChange(@$el.scrollTop,true)
      if @state.startFinished and @rowHeight > -1
        changedHeight = Math.abs(@offsetHeight-@$el.offsetHeight)/@clusterHeight*@clusterSizeFac > 0.2
        if @flex
          changedWidth = @$el.clientWidth - @itemsPerRow*@itemWidth
          if changedWidth > @itemWidth or changedWidth < 1
            process()
        else if changedHeight
          process()


    start: (top = @$el.scrollTop) ->
      @state.started = true
      @processTemplate()
      @state.loading = true
      if @data?
        @$watch("data", @processData) # watch data only if static
      count = 0
      if @flex
        count = @flexInitial
      @getData 0,count, (data) =>
        @getAndProcessDataCount()
        if @flex
          @clusters[0].data = [data]
        else
          @clusters[0].data = data
        @$nextTick =>
          @calcRowHeight()
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
          @dataCount = count
          @clustersCount = Math.ceil(@dataCount / @itemsPerRow / @clusterSize)
          @updateLastRowHeight()
      getDataCount processDataCount

    calcRowHeight: ->
      if @flex
        maxHeights = [0]
        el = @clusters[0].$el
        lastTop = Number.MIN_VALUE
        itemsPerRow = []
        itemsPerRowLast = 0
        row = el.children[1]
        items = row.children.length-1
        width = 0
        k = 0
        for i in [1..items]
          child = row.children[i]
          rect = child.getBoundingClientRect()
          style = window.getComputedStyle(child)
          height = rect.height + parseInt(style.marginTop,10) + parseInt(style.marginBottom,10)
          width += rect.width
          if rect.top > lastTop + maxHeights[k]*1/3 and i > 1
            j = i-1
            k++
            itemsPerRow.push j-itemsPerRowLast
            itemsPerRowLast = j
            lastTop = rect.top
            maxHeights.push height
          else
            if lastTop < rect.top
              lastTop = rect.top
            if maxHeights[maxHeights.length-1] < height
              maxHeights[maxHeights.length-1] = height
        itemsPerRow.shift()
        maxHeights.shift()
        if itemsPerRow.length > 0
          @itemsPerRow = Math.floor(itemsPerRow.reduce((a,b)->a+b)/itemsPerRow.length*@flexFac)
        else
          @itemsPerRow = items
        @itemWidth = width / items
        if maxHeights.length > 0
          @rowHeight = maxHeights.reduce((a,b)->a+b)/maxHeights.length
        else
          @rowHeight = height
      else
        @rowHeight = @clusters[0].$el.children[1].getBoundingClientRect().height
      @calcClusterSize()

    calcClusterSize: ->
      @offsetHeight = @$el.offsetHeight
      @clusterSize = Math.ceil(@$el.offsetHeight/@rowHeight*@clusterSizeFac)*@itemsPerRow
      if @dataCount
        @clustersCount = Math.ceil(@dataCount / @itemsPerRow / @clusterSize)
        @updateLastRowHeight()
      @clusterHeight = @rowHeight*@clusterSize/@itemsPerRow
      for cluster in @clusters
        cluster.height = @clusterHeight

    updateLastRowHeight: ->
      if @dataCount and @clusterSize
        newHeight = (@dataCount - (@clusterVisible+@clustersBelow+1)*@clusterSize)*@rowHeight / @itemsPerRow
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
            cluster.height = data.length * @rowHeight / @itemsPerRow
          else
            cluster.height = @clusterHeight
          if @flex
            data2 = []
            currentData = []
            for d,i in data
              if i %% @itemsPerRow == 0
                currentData = []
                data2.push currentData
              currentData.push d
            cluster.data = data2
          else
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
        @redraw()

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
