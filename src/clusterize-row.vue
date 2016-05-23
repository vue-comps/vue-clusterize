// out: ..
<template lang="pug">
.clusterize-row(v-bind:style="{height:height+'px',overflow:'visible',display:loading?'none':null}")
</template>

<script lang="coffee">
module.exports =

  props:
    "height":
      type: Number
    "data":
      default: null
    "loading":
      type: Number
      default: 0

  data: ->
    isRow: true

  el: -> document.createElement "div"
</script>
