# vue-clusterize

An implementation of [Clusterize.js](https://nexts.github.io/Clusterize.js/) in [vue](http://vuejs.org/).

Works similar to `v-for` but only takes enough data to fill the viewport about 4 times.  
This data is then splitted into four clusters which will move and get filled with the right data on scrolling.

# Disclaimer

Only for [**webpack**](https://webpack.github.io/) workflows.

**No jQuery dependency**

### Works, but there are probably some bugs since there are no unit tests yet.

# Install

```sh
npm install --save-dev vue-clusterize
```
Without css, only `webpack` is needed.
```sh
npm install --save-dev webpack
```

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
#### Props
| Name | type | default | description |
| ---:| --- | ---| --- |
| bindingName | String | "data" | name to access the data in your template |
| autoHeight | Boolean | false | If autoheight should be used (see below) |
| scrollBars | object | {x:true,y:true}| should there be scrollbars on hover |
| autoStart | Boolean | true | rendering starts on `ready` (otherwise call `start`)|
| data | Array | [] | static data to render |
| dataGetter | Function | null | used for dynamic data (see below) |
| rowCounter | Function | null | used for dynamic data (see below) |
| scrollPosition | Object | {left: -1, top: -1} | used to scroll to a specific position |

## Autoheight

There are two ways clusterize can be used, either use a fixed height:
```jade
//- in the template
clusterize(v-bind:data="rowsData" style="height: 400px" v-ref:clusterize)
```
make sure to call the `this.$refs.clusterize.updateHeight()` function when you change the height at runtime

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

The clusterize element can take two functions to get dynamic data:  
`dataGetter(first,last,cb)` and `rowCounter(cb)` both should either call the `cb` or return a promise with the results.

`dataGetter` is expected to call the `cb` or return a promise with an array containing the data to draw.  
To get the first data piece `dataGetter(0,0,cb)` will be called.

`rowCounter` is expected to call the `cb` or return a promise with the absolute number of data pieces available.  
This is used to calculate the scrollbar.  
`rowCounter` is optional but omitting will lead to a changing scrollbar on scroll.

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

## License
Copyright (c) 2015 Paul Pflugradt
Licensed under the MIT license.
