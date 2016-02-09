<template lang="jade">
clusterize(v-bind:data="rowsData" v-bind:height="400" style="width:200px")
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
    rowsData: (x for x in [1...10000])
</script>
