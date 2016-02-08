// out: ..
<template lang="jade">
.clusterize-cluster
  .clusterize-cluster-loading(v-el:loading v-bind:style="{height:data.length*rowHeight+'px'}" v-show="loading")
    slot loading...
</template>

<script lang="coffee">

module.exports =
  props:
    "bindingName":
      type: String
      default: "data"
    "loading":
      type: Number
      default: 0
    "nr":
      type: Number
    "rowHeight":
      type: Number
    "data":
      type: Array
      default: -> []
  data: ->
    isCluster: true
    factory: null
    Vue: null
    end: null
    frags: []
  ready: ->
    @Vue = @$root.constructor
    @end = @Vue.util.createAnchor('clusterize-cluster-end')
    @$el.appendChild(@end)
  methods:
    createFrag: (i) ->
      parentScope = @$parent.$parent
      scope = Object.create(parentScope)
      scope.$refs = Object.create(parentScope.$refs)
      scope.$els = Object.create(parentScope.$els)
      scope.$parent = parentScope
      scope.$forContext = @
      @Vue.util.defineReactive(scope,@bindingName,@data[i])
      @Vue.util.defineReactive(scope,"height",@rowHeight)
      @Vue.util.defineReactive(scope,"loading",@loading)
      frag = @factory.create(@, scope, @$options._frag)
      frag.before(@end)
      @frags[i] = frag
    destroyFrag: (i) ->
      @frags[i].remove()
  watch:
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
    rowHeight: (newHeight)->
      for frag,index in @frags
        frag.scope.height = newHeight
    loading: (loading)->
      for frag,index in @frags
        frag.scope.loading = loading
</script>
<style lang="stylus">
div.clusterize-cluster
  overflow visible
  margin 0
  padding 0
  position relative
</style>
