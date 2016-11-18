<template lang="pug">
.container
  a(href="https://vue-comps.github.io/vue-clusterize/blob/master/dev/autoheight.vue") source
  p resize the window
  p rows per cluster: {{clusterSize}}
  .scrollcontainer(style="height:80%;position:relative")
    clusterize(ref="clusterize" v-bind:data="rowsData" auto-height v-bind:style="{width:'200px',border:'solid 1px black'}")
      div.clusterize-row {{data}}
</template>

<script lang="coffee">
module.exports =
  mixins: [
    require "vue-mixins/setCss"
  ]
  components:
    "clusterize": require "../src/clusterize.vue"
  data: ->
    rowsData: (x for x in [1..10000])
    clusterSize: 0
    timer: null
  mounted: ->
    @timer = setInterval (=> @clusterSize = @$refs.clusterize.clusterSize),500
    document.body.setAttribute "style","height:100%"
    @setCss document.body, "height", "100%"
    @setCss document.documentElement, "height", "100%"
  destroyed: ->
    clearInterval(@timer) if @timer?
    @setCss document.body, "height"
    @setCss document.documentElement, "height"
</script>

<style lang="stylus">
.clusterize
  border 1px solid black
.container > a
  position absolute
  left 250px
  top 40px
</style>
