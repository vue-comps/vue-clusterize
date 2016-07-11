<template lang="pug">
.container
  a(href="https://vue-comps.github.io/vue-clusterize/blob/master/dev/basic.vue") source
  clusterize(v-ref:clusterize v-bind:data="rowsData" v-bind:height="400" v-bind:style="{width:'200px'}")
    div.clusterize-row {{data}}
      tooltip(position="body") index: {{index}}
</template>

<script lang="coffee">
module.exports =
  components:
    "clusterize": require "../src/clusterize.vue"
    "tooltip": require "vue-comps-tooltip"
  data: ->
    rowsData: (x for x in [1..10000])
</script>

<style lang="stylus">
.clusterize
  border 1px solid black
.container > a
  position absolute
  left 250px
  top 40px
.tooltip
  padding 5px
  background white
  border 1px solid black
</style>
