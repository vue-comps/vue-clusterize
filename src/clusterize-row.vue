// out: ..
<template lang="jade">
.clusterize-row(v-bind:style="{height:height+'px'}" v-show="data != null")
  slot
</template>

<script lang="coffee">
module.exports =
  props:
    "height":
      type: Number
    "data":
      default: null
  el: -> document.createElement "div"

</script>
<style lang="stylus">
div.clusterize-row
  overflow visible
</style>
