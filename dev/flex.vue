<template lang="pug">
.container
  a(href="https://vue-comps.github.io/vue-clusterize/blob/master/dev/autoheight.vue") source
  p resize the window
  p Same size // items per cluster: {{clusterSize}}
  p(style="margin-left:50%") Different size with display:flex // items per cluster: {{clusterSize2}}
  .scrollcontainer(style="height:80%;position:relative;width:40%;float:left")
    clusterize(v-ref:clusterize v-bind:data="rowsData" flex v-bind:flex-initial="100" auto-height v-bind:style="{border:'solid 1px black'}")
      div(style="clear:both")
        span(style="float:left;padding:5px" v-for="d in data") {{d}}
  .flexcontainer(style="height:80%;position:relative;width:40%;float:left")
    clusterize(v-ref:clusterize2 @get-data="getData" @get-data-count="getDataCount" flex v-bind:flex-fac=0.96 v-bind:flex-initial="40" auto-height v-bind:style="{border:'solid 1px black'}")
      div(style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between")
        div(style="text-align:center;margin:5px",v-bind:style="{background:d.color,height:d.height,width:d.width}",v-for="d in data") {{d.i}}
</template>

<script lang="coffee">
module.exports =
  mixins: [
    require "vue-mixins/setCss"
  ]
  components:
    "clusterize": require "../src/clusterize.vue"
  data: ->
    rowsData: (x for x in [10000..99999])
    clusterSize: 2
    clusterSize2: 2
    timer: null
    timer2: null
  attached: ->
    @timer = setInterval (=> @clusterSize = @$refs.clusterize.clusterSize),500
    @timer2 = setInterval (=> @clusterSize2 = @$refs.clusterize2.clusterSize),500
    document.body.setAttribute "style","height:100%"
    @setCss document.body, "height", "100%"
    @setCss document.documentElement, "height", "100%"
  detached: ->
    clearInterval(@timer) if @timer?
    @setCss document.body, "height"
    @setCss document.documentElement, "height"
  methods:
    getData: (first,last,cb) ->
      result = []
      letters = '0123456789ABCDEF'.split('')
      for i in [first..last]
        if i < 10000
          color = '#'
          for j in [0..5]
            color += letters[Math.floor(Math.random() * 16)]
          height = 50 +(Math.random()-0.5)*15+'px'
          width = 80 +(Math.random()-0.5)*40+'px'
          result.push
            color: color
            height: height
            width: width
            i: i
      cb(result)
    getDataCount: (cb) ->
      cb(10000)
</script>

<style lang="stylus">
.clusterize
  border 1px solid black
.container > a
  position absolute
  left 250px
  top 40px
</style>
