// out: ..
<template lang="jade">
.clusterize-row(v-bind:style="{height:height+'px'}" v-show="!(data === null || loading != 0)")
</template>

<script lang="coffee">
module.exports =
  props:
    "loading":
      type: Number
      default: 0
    "height":
      type: Number
    "data":
      default: null
  data: ->
    isRow: true
  el: -> document.createElement "div"

</script>
<style lang="stylus">
div.clusterize-row
  overflow visible
</style>
