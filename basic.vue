<template lang="jade">
.container
  a(href="https://github.com/paulpflug/vue-clusterize/blob/master/dev/basic.vue") source
  clusterize(v-ref:clusterize v-bind:data="rowsData" v-bind:height="400" style="width:200px")
    clusterize-row
      {{data}}
    p(slot="loading") loading
</template>

<script lang="coffee">
module.exports =
  components:
    "clusterize": require "../clusterize.js"
    "clusterize-row": require "../clusterize-row.js"
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
</style>
