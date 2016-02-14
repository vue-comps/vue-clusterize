<template lang="jade">
.container
  a(href="https://github.com/paulpflug/vue-clusterize/blob/master/dev/autoheight.vue") source
  p resize the window
  p rows per cluster: {{clusterSize}}
  .scrollcontainer(style="height:80%;position:relative")
    clusterize(v-ref:clusterize v-bind:data="rowsData" v-bind:auto-height="true" style="width:200px;border:solid 1px black")
      clusterize-row
        {{data}}
      p(slot="loading") loading
</template>

<script lang="coffee">
module.exports =
  mixins: [
    require "vue-mixins/setCss"
  ]
  components:
    "clusterize": require "../clusterize.js"
    "clusterize-row": require "../clusterize-row.js"
  data: ->
    rowsData: (x for x in [1..10000])
    clusterSize: 0
    timer: null
  attached: ->
    @timer = setInterval (=> @clusterSize = @$refs.clusterize.clusterSize),500
    document.body.setAttribute "style","height:100%"
    @setCss document.body, "height", "100%"
    @setCss document.documentElement, "height", "100%"
  detached: ->
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
