// out: ..
<template lang="pug">
.clusterize-cluster(
  :class="{loading:loading}",
  :style="{height:height+'px',overflow:'visible',position:'relative',margin:0,padding:0}"
  )
  .clusterize-cluster-loading(
    v-el:loading,
    v-show="loading"
    )
    slot loading...
</template>

<script lang="coffee">
module.exports =

  mixins: [
    require("vue-mixins/vue")
  ]

  props:
    "bindingName":
      type: String
      default: "data"
    "loading":
      type: Number
      default: 0
    "nr":
      type: Number
    "height":
      type: Number
    "data":
      type: Array
      default: -> []
    "rowWatchers":
      type: Object
    "parentVm":
      type: Object

  data: ->
    isCluster: true
    factory: null
    Vue: null
    end: null
    frags: []

  ready: ->
    @end = @Vue.util.createAnchor('clusterize-cluster-end')
    @$el.appendChild(@end)
    for key,val of @rowWatchers
      @initRowWatchers(key,val)

  methods:
    createFrag: (i) ->
      parentScope = @parentVm
      scope = Object.create(parentScope)
      scope.$refs = Object.create(parentScope.$refs)
      scope.$els = Object.create(parentScope.$els)
      scope.$parent = parentScope
      scope.$forContext = @
      @Vue.util.defineReactive(scope,@bindingName,@data[i])
      @Vue.util.defineReactive(scope,"loading",@loading)
      for key,val of @rowWatchers
        @Vue.util.defineReactive(scope,key,val.vm[val.prop])
        scope[key] = val.vm[val.prop]
      frag = @factory.create(@, scope, @$options._frag)
      frag.before(@end)
      @frags[i] = frag
    destroyFrag: (i) ->
      @frags[i].remove()
    initRowWatchers: (key,obj) ->
      self = @
      obj.vm.$watch obj.prop, (val) ->
        for frag in self.frags
          frag.scope[key] = val

    redraw: ->
      if @frags.length > 0
        for i in [0...@frags.length]
          @destroyFrag(i)
          @createFrag(i)
  watch:
    "factory": "redraw"
    "rowWatchers": (newRW,oldRW) ->
      for key,val of newRW
        unless oldRW[key]?
          @initRowWatchers(key,val)
    data: (newData, oldData)->
      diff = newData.length-oldData.length
      if diff > 0
        for i in [0...diff]
          @createFrag(oldData.length+i)
      else if diff < 0
        for i in [diff...0]
          @destroyFrag(oldData.length+i)
      for frag,index in @frags
        frag.scope.data = newData[index]
    loading: (newLoading) ->
      for frag in @frags
        frag.scope.loading = newLoading
</script>
