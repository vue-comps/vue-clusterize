# vue-clusterize

An implementation of [Clusterize.js](https://nexts.github.io/Clusterize.js/) in [vue](http://vuejs.org/).

Works similar to `v-for` but only takes enough data to fill the viewport  3 times.  
This data is then splitted into three clusters which will move and get filled with the right data on scrolling.

### [See it in action](https://vue-comps.github.io/vue-clusterize/)

# Disclaimer

Only for [**webpack**](https://webpack.github.io/) workflows.

**No jQuery dependency**


# Install

```sh
npm install --save-dev vue-clusterize
```
Without css, only `webpack` is needed.
```sh
npm install --save-dev webpack
```
use version 0.2.0 before vue `1.0.24`

## Usage
```coffee
# link the components up
components:
  "clusterize": require "vue-clusterize/clusterize"
  "clusterize-row": require "vue-clusterize/clusterize-row"
```
```jade
//- in the template
clusterize(v-bind:data="rowsData")
  clusterize-row
    {{data}}
  p(slot="loading") loading...
```
see `dev/` folder for more examples
#### Props
| Name | type | default | description |
| ---:| --- | ---| --- |
| bindingName | String | "data" | name to access the data in your template |
| height | Number | null | Height of the clusterize element |
| autoHeight | Boolean | false | If autoheight should be used (see below) |
| scrollBars | object | {x:true,y:true}| should there be scrollbars on hover |
| autoStart | Boolean | true | rendering starts on `ready` (otherwise call `start`)|
| data | Array | [] | static data to render |
| scrollPosition | Object | {left: -1, top: -1} | used to scroll to a specific position |
| clusterSizeFac | Number | 1.5 | determines the cluster size relative to visible size |

## Autoheight

There are two ways clusterize can be used, either use a fixed height:
```jade
//- in the template
clusterize(v-bind:data="rowsData" v-bind:height="400" v-ref:clusterize)
```

Or use autoheight:
```jade
html(style="height:100%")
  body(style="height:100%")
    .parent(style="position:relative")
      clusterize(v-bind:data="rowsData" v-bind:auto-height="true")
```
In this case clusterize will always fill the nearest parent element with either `position:relative;` or `position:absolute;`
`updateHeight` will be called automatically, e.g. on window resize.  
Keep in mind, that `padding` of the parent will be ignored. If you need a padding, use a wrapper `<div>`.

## Dynamic data

The clusterize instance emits to events to get dynamic data:
```
//- in the template
<clusterize @get-data="getData" @get-data-count="getDataCount">
  ...

# In the containing component:
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
Clone repository
```sh
npm install
npm run test
```
Browse to `http://localhost:8080/`

Best development experience in [atom](https://atom.io/) with [vue-autocompile](https://atom.io/packages/vue-autocompile).

## To-Do
- allow more than one (fixed-width) object per row + autosize to adjust #objects to actual width.
- use html5 history mode or document.store to save scroll position

## License
Copyright (c) 2016 Paul Pflugradt
Licensed under the MIT license.
