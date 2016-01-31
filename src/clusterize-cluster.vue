// out: ..
<template lang="jade">
.clusterize-cluster(
  v-el:cluster
  )
  slot(:height="rowHeight" :data.sync="d" v-for="d in data")
</template>

<script lang="coffee">

module.exports =
  props:
    "nr":
      type: Number
    "rowHeight":
      type: Number
    "data":
      type: Array
      default: -> ["test"]
  data: ->
    isCluster: true
</script>
<style lang="stylus">
div.clusterize-cluster
  overflow visible
  margin 0
  padding 0
  position relative
</style>
