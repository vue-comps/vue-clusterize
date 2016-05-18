# vue-clusterize

An implementation of [Clusterize.js](https://nexts.github.io/Clusterize.js/) in [vue](http://vuejs.org/).

Works similar to `v-for` but only takes enough data to fill the viewport  3 times.  
This data is then splitted into three clusters which will move and get filled with the right data on scrolling.

### [Demo](https://paulpflug.github.io/vue-clusterize)

# Install

```sh
npm install --save-dev vue-clusterize
```
or include `build/bundle.js`.

## Usage
```coffee
# link the components up
components:
  "clusterize": require "vue-clusterize/clusterize"
  "clusterize-row": require "vue-clusterize/clusterize-row"
```
```html
<clusterize :data="rowsData">
  <clusterize-row>{{data}}</clusterize-row>
  <p slot="loading">loading...</p>
</clusterize>
```
For examples see [`dev/`](https://github.com/vue-comps/vue-clusterize/tree/master/dev).

#### Props
| Name | type | default | description |
| ---:| --- | ---| --- |
| binding-name | String | "data" | name to access the data in your template |
| height | Number | null | Height of the clusterize element |
| auto-height | Boolean | false | If autoheight should be used (see below) |
| scroll-bars | object | {x:true,y:true}| should there be scrollbars on hover |
| auto-start | Boolean | true | rendering starts on `ready` (otherwise call `start`)|
| data | Array | [] | static data to render |
| scroll-position | Object | {left: -1, top: -1} | used to scroll to a specific position |
| cluster-size-fac | Number | 1.5 | determines the cluster size relative to visible size |

## Autoheight

There are two ways clusterize can be used, either use a fixed height:
```html
<clusterize :data="rowsData" :height="400" v-ref:clusterize>
```

Or use autoheight:
```html
<html style="height:100%">
  <body style="height:100%">
    <div style="position:relative">
      <clusterize :data="rowsData" :auto-height="true">
```
In this case clusterize will always fill the nearest parent element with either `position:relative;` or `position:absolute;`
`updateHeight` will be called automatically, e.g. on window resize.  
Keep in mind, that `padding` of the parent will be ignored. If you need a padding, use a wrapper `<div>`.

## Dynamic data

The clusterize instance emits to events to get dynamic data:
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

If you want to enforce a scroll-to-top, call `setScrollTop(0)` or use the `scrollPosition` prop.

# Development
Clone repository.
```sh
npm install
npm run test
```
Browse to `http://localhost:8080/`.

## To-Do
- allow more than one (fixed-width) object per row + autosize to adjust #objects to actual width.
- use html5 history mode or document.store to save scroll position

## License
Copyright (c) 2016 Paul Pflugradt
Licensed under the MIT license.
