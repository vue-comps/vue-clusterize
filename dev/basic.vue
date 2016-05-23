<template lang="jade">
.container
  a(href="https://vue-comps.github.io/vue-clusterize/blob/master/dev/basic.vue") source
  clusterize(v-ref:clusterize v-bind:data="rowsData" v-bind:height="400" style="width:200px")
    clusterize-row {{data}}
    p(slot="loading") loading
</template>

<script lang="coffee">
module.exports =
  components:
    "clusterize": require "../src/clusterize.vue"
    "clusterize-row": require "../src/clusterize-row.vue"
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
