# vue-clusterize

An implementation of [Clusterize.js](https://nexts.github.io/Clusterize.js/) in [vue](http://vuejs.org/).

Works similar to `v-for` but only takes enough data to fill the viewport  3 times.  
This data is then splitted into three clusters which will move and get filled with the right data on scrolling.

### [Demo](https://vue-comps.github.io/vue-clusterize/)

# Disclaimer

Only for [**webpack**](https://webpack.github.io/) workflows.

**No jQuery dependency**

# Install

```sh
npm install --save-dev vue-clusterize
```

use version 0.2.0 before vue `1.0.24`

## Usage
```coffee
# link the components up
components:
  "clusterize": require("vue-clusterize")
# or ES6
import clusterize from "vue-clusterize"
components: {
  "clusterize": clusterize
}
```
```html
<clusterize :data="rowsData">
  <!-- default slot will be used as a template for a single row -->
  <div>{{data}}</div>
  <!-- (optional) loading slot will be displayed in each cluster which is busy fetching data - only with dynamic data -->
  <p slot="loading">loading...</p>
</clusterize>
```
For examples see [`dev/`](https://github.com/vue-comps/vue-clusterize/tree/master/dev).

#### Available variables in template
| Name | type | description |
| ---:| --- |  --- |
| data | Object | a single datapiece (see `binding-name` in props) |
| loading | Number |  will be 0 when finished loading data (only with dynamic data) |
| index | Number | index of the datapiece |
| height | Number | the height of a single row |

you can add your own variables with the `row-watchers` prop.

example:
```html
<clusterize @get-data="getData">
  <div v-if="!loading" v-bind:style="{height:height+'px'}">{{data}} - index: {{index}}</div>
  <p slot="loading">loading...</p>
</clusterize>
```

#### Props
| Name | type | default | description |
| ---:| --- | ---| --- |
| binding-name | String | "data" | name to access the data in your template |
| height | Number | null | Height of the clusterize element |
| auto-height | Boolean | false | If autoheight should be used (see below) |
| manual-start | Boolean | false | rendering doesn't start on `ready` (call `start` on the component instance instead)|
| data | Array | [] | static data to render |
| scroll-top | Number | 0 | sets scrollTop |
| scroll-left | Number | 0 | sets scrollLeft |
| cluster-size-fac | Number | 1.5 | determines the cluster size relative to visible size |
| row-height | Number | null | enforced row-height, will be determined at runtime when not set |
| template | String | - | row template (defaults to slot content) |
| style | Object | - | to pass trough style (vue object) |
| row-watchers | Object | {height: {vm: this, prop:"rowHeight"}} | variables, will be available in template |
| parent-vm | Object | this.$parent | where to resolve components in template |
| flex | Boolean | false | allow multiple items per row. See [flex](#flex). |
| flex-initial | Number | 20 | data pieces to take for calculation of row height (should fill several rows) |
| flex-fac | Number | 1 | reduce to reduce items per row |

## Autoheight

There are two ways clusterize can be used, either use a fixed height:
```html
<clusterize :data="rowsData" :height="400" ref="clusterize">
```

Or use autoheight:
```html
<html style="height:100%">
  <body style="height:100%">
    <div style="position:relative">
      <clusterize :data="rowsData" auto-height>
```
In this case clusterize will always fill the nearest parent element with either `position:relative;` or `position:absolute;`.  
Keep in mind, that `padding` of the parent will be ignored. If you need a padding, use a wrapper `<div>`.

## Dynamic data

The clusterize instance emits two events to get dynamic data:
```html
<clusterize @get-data="getData" @get-data-count="getDataCount">
```
```js
methods:
  # For the first datapiece, first and last will be 0
  getData: function(first,last,cb) {
      # somehow get data
      cb(data)
    }
  getDataCount: function(cb) {
    cb(dataCount)
  }
```

To issue a manual redraw, call `redraw()` on the clusterize instance.

If you want to enforce a scroll-to-top use the `scrollTop` prop.

## Flex

When using the `flex` prop, the usage changes. You will now recieve a array of row items per row which you can use in a `v-for`:
```html
<clusterize :data="rowsData" flex>
  <div style="display:flex;align-items:center;justify-content:space-between">
    <div v-for="d in data">{{d}}</div>
  </div>
</clusterize>
```
The row height, items per row and rows per cluster will be recalculated on resize of clusterize.

# Development
Clone repository.
```sh
npm install
npm run test
```
Browse to `http://localhost:8080/`.

## To-Do
- use html5 history mode or document.store to save scroll position

## License
Copyright (c) 2016 Paul Pflugradt
Licensed under the MIT license.
