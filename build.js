(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.boundingboxCrosshatching = factory());
}(this, (function () { 'use strict';

	var pickByAlias = function pick (src, props, keepRest) {
		var result = {}, prop, i;

		if (typeof props === 'string') props = toList(props);
		if (Array.isArray(props)) {
			var res = {};
			for (i = 0; i < props.length; i++) {
				res[props[i]] = true;
			}
			props = res;
		}

		// convert strings to lists
		for (prop in props) {
			props[prop] = toList(props[prop]);
		}

		// keep-rest strategy requires unmatched props to be preserved
		var occupied = {};

		for (prop in props) {
			var aliases = props[prop];

			if (Array.isArray(aliases)) {
				for (i = 0; i < aliases.length; i++) {
					var alias = aliases[i];

					if (keepRest) {
						occupied[alias] = true;
					}

					if (alias in src) {
						result[prop] = src[alias];

						if (keepRest) {
							for (var j = i; j < aliases.length; j++) {
								occupied[aliases[j]] = true;
							}
						}

						break
					}
				}
			}
			else if (prop in src) {
				if (props[prop]) {
					result[prop] = src[prop];
				}

				if (keepRest) {
					occupied[prop] = true;
				}
			}
		}

		if (keepRest) {
			for (prop in src) {
				if (occupied[prop]) continue
				result[prop] = src[prop];
			}
		}

		return result
	};

	var CACHE = {};

	function toList(arg) {
		if (CACHE[arg]) return CACHE[arg]
		if (typeof arg === 'string') {
			arg = CACHE[arg] = arg.split(/\s*,\s*|\s+/);
		}
		return arg
	}

	var parseRect_1 = parseRect;

	function parseRect (arg) {
	  var rect;

	  // direct arguments sequence
	  if (arguments.length > 1) {
	    arg = arguments;
	  }

	  // svg viewbox
	  if (typeof arg === 'string') {
	    arg = arg.split(/\s/).map(parseFloat);
	  }
	  else if (typeof arg === 'number') {
	    arg = [arg];
	  }

	  // 0, 0, 100, 100 - array-like
	  if (arg.length && typeof arg[0] === 'number') {
	    // [w, w]
	    if (arg.length === 1) {
	      rect = {
	        width: arg[0],
	        height: arg[0],
	        x: 0, y: 0
	      };
	    }
	    // [w, h]
	    else if (arg.length === 2) {
	      rect = {
	        width: arg[0],
	        height: arg[1],
	        x: 0, y: 0
	      };
	    }
	    // [l, t, r, b]
	    else {
	      rect = {
	        x: arg[0],
	        y: arg[1],
	        width: (arg[2] - arg[0]) || 0,
	        height: (arg[3] - arg[1]) || 0
	      };
	    }
	  }
	  // {x, y, w, h} or {l, t, b, r}
	  else if (arg) {
	    arg = pickByAlias(arg, {
	      left: 'x l left Left',
	      top: 'y t top Top',
	      width: 'w width W Width',
	      height: 'h height W Width',
	      bottom: 'b bottom Bottom',
	      right: 'r right Right'
	    });

	    rect = {
	      x: arg.left || 0,
	      y: arg.top || 0
	    };

	    if (arg.width == null) {
	      if (arg.right) rect.width = arg.right - rect.x;
	      else rect.width = 0;
	    }
	    else {
	      rect.width = arg.width;
	    }

	    if (arg.height == null) {
	      if (arg.bottom) rect.height = arg.bottom - rect.y;
	      else rect.height = 0;
	    }
	    else {
	      rect.height = arg.height;
	    }
	  }

	  return rect
	}

	var newArray_1 = newArray;

	function newArray (n, value) {
	  n = n || 0;
	  var array = new Array(n);
	  for (var i = 0; i < n; i++) {
	    array[i] = value;
	  }
	  return array
	}

	/**
	 * Fill a bounding box with crosshatching defined by a particular spacing and at
	 * a particular angle. This 
	 * 
	 * @export
	 * @param {rectangle} bbox The rectangle in which the crosshatching will be placed
	 * @param {number} spacing The density of the crosshatching
	 * @param {number} angle The angle that the crosshatching is created
	 * @see {@link https://www.npmjs.com/package/parse-rect}
	 */
	function boundingboxCrosshatching(bbox, spacing, angle=Math.PI) {
	  const rect = parseRect_1(bbox);
	  const numLines = Math.ceil((rect.width) / spacing);

	  const hatches = newArray_1(numLines).map((_, i) => {
	    return [
	      [rect.x + spacing * i, rect.y],
	      [rect.x + spacing * i, rect.y + rect.height]
	    ];
	  });

	  return hatches;
	}

	return boundingboxCrosshatching;

})));
