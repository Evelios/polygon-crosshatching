# polygon-crosshatching

Fill a convex polygon with crosshatching defined by a particular spacing and at
a particular angle. This is a umd build so it can be included in the browser or
in your node app.

# Usage

`polygonCrosshatching(bbox, spacing, angle)`
+ `bbox` The rectangle in which the crosshatching will be placed
  + Rectangle definition can have many forms. They are listed in the [parse-rect](https://www.npmjs.com/package/parse-rect) npm library
+ `spacing` spacing The density of the crosshatching
+ `angle` The angle that the crosshatching is created in radians

The output is a list of line with the points in list form
```js
[
  [[x1, y1], [x2, y2]], // one line
  [[x1, y1], [x2, y2]], // another
  ...
]
```

### Example in code
```js
// Browser include
<script src="./node_modules/polygon-crosshatching/build.js"></script>
// this incldues the global function `polygonCrosshatching` into the namespace

// Node's CJS Include
const poylgonCrosshatching = require(polygon-crosshatching);

const bbox = { x: 10, y: 10, height: 400, width: 600 };
const spacing = 25;
const angle = Math.PI / 3; // 30deg

const hatches = polygonCrosshatching(bbox, spacing, angle);
// output is a list of lines
```

### Example output
![polygon-crosshatching](./example.png)
