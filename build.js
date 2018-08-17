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

	var Vector = (function() {
	    /**
	     * @class Vector
	     *
	     * This is a basic Vector class. This vector class is based off a list data
	     * type. So all vectors are stored as a list of [x, y]. These vectors can
	     * me rotated, translated, stretched, pulled, and generally geometrically
	     * played with.
	     * 
	     * @property {number} Precision The precision of the floating point numbers
	     * 
	     * @summary Create a 2D Vector object
	     */

	    //---- Default Constructor ----

	    const _p = 8;
	    const Precision = 1 / Math.pow(10, _p);

	    /**
	     * Create a vector object from a List or Object type vector notation.
	     * 
	     * @example
	     * // Seperate
	     * var vec = Vector(x, y);
	     * 
	     * // Array
	     * var vec = Vector([x, y]);
	     * 
	     * // Object
	     * var vec = Vector({x, y});
	     * 
	     * @param {object|Array} vec The input vector 
	     * 
	     * @returns {Array} The vector array in the form [x, y]
	     * @throws {TypeError} If the array is NaN or infinity
	     */
	    const Vector = function(x, y) {
	        if (Array.isArray(x)) {
	            if (x.length == 2) {
	                return [_clean(x[0]), _clean(x[1])];
	           }
	           else {
	               throw new ValueError('Vector is of length ' + x.length + ' instead of length 2');
	           }
	        }
	        else if (x.hasOwnProperty('x') && x.hasOwnProperty('y')) {
	            return [_clean(x.x), _clean(x.y)];
	        }
	        else {
	            return [_clean(x), _clean(y)];
	        }
	    };

	    //---- Alternate Polar Constructor ----

	    /**
	     * Create a vector from polar coordinates
	     *
	     * @param {number} radius The radius of the vector
	     * @param {number} theta The angle of the vector in radians.
	     *  Should be between 0 and 2*PI
	     * 
	     * @returns The rectangular vector produced from the polar coordinates
	     *
	     */
	    const Polar = function(radius, theta) {
	        return Vector(radius * Math.cos(theta), radius * Math.sin(theta));
	    };

	    //---- Helper Functions ----
	    
	    /**
	     * Cleans up the number to make sure that the value is not NaN and is finite.
	     * It also checks for floating point precision and rounds based on the
	     * vector floating point precision.
	     * 
	     * @private
	     * @param {number} num The number to be cleaned
	     * @returns {number} The cleaned output number
	     *  
	     * @throws {RangeError} Throws range error if the value is NaN or -Inf or +Inf 
	     */
	    const _clean = function(num) {
	        if (isNaN(num)) {
	            throw new RangeError('Value is NaN');
	        }

	        if (!isFinite(num)) {
	            throw new RangeError('Value is Infinite');
	        }

	        if (Math.round(num) == num) {
	            return num;
	        }

	        return Math.round(num / Precision) * Precision;
	    };

	    /**
	     * Determine if two numbers are almost equal to eachother. This is based on
	     * the Precision value
	     * 
	     * @private
	     * @param {number} a The first value 
	     * @param {number} b The second value
	     * @returns {boolean} True if the values are almost equal to eachother
	     * 
	     */
	    const _almostEqual = function(a, b) {
	        return Math.abs(_clean(a) - _clean(b)) < Precision;
	    };

	    /**
	     * Determine if two vectors are equal to eachother
	     * 
	     * @param {Vector} a The first vector 
	     * @param {Vector} b The second vector
	     * @returns {boolean} True if the two vectors are equal to eachother
	     * 
	     */
	    const equals = function(a, b) {
	        return _almostEqual(a[0], b[0]) &&
	               _almostEqual(a[1], b[1]);
	    };

	    /**
	     * Returns the vector as a string of (x, y)
	     *
	     * @param {number[]} vec The input vector
	     * 
	     * @returns {string} The string representation of a vector in (x, y) form
	     */
	    const toString = function(vec) {
	        return `(${vec[0]}, ${vec[1]})`;
	    };

	    /**
	     * Get a copy of the input vector
	     *
	     * @param {Vector} vec the vector to be coppied
	     * @returns {Vector} The vector copy
	     */
	    const copy = function(vec) {
	        return Vector(vec);
	    };

	    //---- Vector Properties ----

	    /**
	     * Get the magnitude of the vector
	     *
	     * @param {Vector} vec The vector to determine the magnitude from
	     * @returns {number} The magniture of the vector
	     */
	    const magnitude = function(vec) {
	        return Math.sqrt(magSquared(vec));
	    };

	    /**
	     * Get the magnitude of the vector squared. Use this value if you only need
	     * a number to compare the vectors to and don't need the actual value. This
	     * will save from using the expensive computation of the square route
	     * function.
	     * 
	     * @param {Vector} vec The vector to determine the squared magnitude from
	     * @returns {number} The magnitude of the vector squared 
	     * 
	     */
	    const magSquared = function(vec) {
	        return Math.pow(vec[0], 2) + Math.pow(vec[1], 2);
	    };

	    /**
	     * Get the angle of the input vector
	     * 
	     * @param {Vector} vec The input vector
	     * @returns {number} The angle of the vector in radians
	     * 
	     */
	    const angle = function(vec) {
	        const x = vec[0];
	        const y = vec[1];
	        if (x === 0) {
	            return y == 0 ?     0          :
	                   y >  0 ?     Math.PI / 2:
	                            3 * Math.PI / 2;
	        } else if (y === 0) {
	            return x >= 0 ? 0 : Math.PI;
	        }

	        let angle = Math.atan(y/x);
	        angle = (x < 0 && y < 0) ? angle + Math.PI   : // Quadrant III
	                (x < 0)          ? angle + Math.PI   : // Quadrant II
	                (y < 0)          ? angle + 2*Math.PI : // Quadrant IV
	                                   angle             ; // Quadrant I
	        
	        return angle;
	    };

	    /**
	     * Limit the max magnitude of a vector. If the magnitude is greater than
	     * the input, limit it to the input ammount. Otherwise leave the vector
	     * alone.
	     */
	    const clamp = function(vec, limit) {
	        return magnitude(vec) > limit ? Polar(limit, angle(vec)) : vec;
	    };

	    //---- Basic Math Functions ----

	    /**
	     * Add two vectors element wise
	     *
	     * @param {Vector} a The first vector
	     * @param {Vector} b The second vector
	     * @returns {Vector} The vector result of adding the two vectors
	     */
	    const add = function(a, b) {
	        return Vector(a[0] + b[0], a[1] + b[1]);
	    };

	    /**
	     * Subtract two vectors element wise
	     *
	     * @param {Vector} a The first vector
	     * @param {Vector} b The second Vector
	     * @returns {Vector} The vector result of subtracting the two vectors
	     */
	    const subtract = function(a, b) {
	        return Vector(a[0] - b[0], a[1] - b[1]);
	    };

	    /**
	     * Multiply the vector by a scalar value
	     *
	     * @param {number[]} vec The input vector
	     * @param {number} scalar The number to multiply the vector by
	     * @returns {Vector} The result of multiplying the vector by a scalar
	     *  element wise
	     */
	    const multiply = function(vec, scalar) {
	        return Vector(vec[0] * scalar, vec[1] * scalar);
	    };

	    /**
	     * Divide the vector by a scalar value
	     *
	     * @param {Vector} vec The input vector
	     * @param {number} scalar THe number to multiply the vector by
	     * @returns {Vector} The result of multiplying the vector by a scalar
	     */
	    const divide = function(vec, scalar) {
	        return Vector(vec[0] / scalar, vec[1] / scalar);
	    };

	    //---- Advanced Vector Functions ----
	    
	    /**
	     * Get the normal vector of the current vector.
	     *
	     * @param {Vector} vec The vector to normalize
	     * @returns {Vector} A vector that is the normal compenent of the vector
	     */
	    const normalize = function(vec) {
	        const mag = magnitude(vec);
	        return mag > 0 ? divide(vec, magnitude(vec)) : zero();
	    };

	    /**
	     * Get the get the current vector rotated by a certain ammount clockwise
	     * around a particular point
	     *
	     * @param {Vector} vec The vector to rotate
	     * @param {Vector} around The vector to rotate around
	     * @param {number} angle The ammount to rotate a positive angle rotates
	     *  the vector clockwise
	     * 
	     * @returns {Vector} The vector that results from rotating the current
	     *  vector by a particular ammount
	     */
	    const rotate = function(vec, around, angle) {
	        const x = vec[0];
	        const y = vec[1];
	        const x_origin = around[0];
	        const y_origin = around[1];

	        const x_rotated = ((x - x_origin) * Math.cos(angle)) - 
	                          ((y_origin - y) * Math.sin(angle)) + x_origin;
	        const y_rotated = ((y_origin - y) * Math.cos(angle)) -
	                          ((x - x_origin) * Math.sin(angle)) + y_origin;
	        return Vector(x_rotated, y_rotated);
	    };

	    
	    /**
	     * Get the negation of the x and y coordinates of a vector
	     * 
	     * @param {Vector} vec The input vector
	     * @returns {Vector} The inverse of the input vector
	     */
	    const inverse = function(vec) {
	        return Vector([-vec[0], -vec[1]]);
	    };

	    /**
	     * Get the dot product of two vectors
	     *
	     * @param {Vector} a The first vector
	     * @param {Vector} b The second vector
	     * @returns {number} The dot product of the two vectors
	     */
	    const dot = function(a, b) {
	        return a[0] * b[0] + a[1] * b[1];
	    };

	    /**
	     * Get the average location between several vectors
	     *
	     * @param {Vector[]} vectors The list of vectors to average
	     */
	    const avg = function(vectors) {
	        let average = zero();

	        for (const vector of vectors) {
	            average = add(average, vector);
	        }
	        return divide(average, vectors.length);
	    };

	    /**
	     * Get the cross product of two vectors
	     *
	     * @param {Vector} a The first vector
	     * @param {Vector} b The second vector
	     * @returns {number} The cross product of the two vectors
	     */
	    const cross = function(a, b) {
	        return a[0] * b[1] - a[1] * b[0];
	    };

	    /**
	     * Get the midpoint between two vectors
	     *
	     * @param {Vector} a The first vector
	     * @param {Vector} b The second vector
	     * @returns The midpoint of two vectors
	     */
	    const midpoint = function(a, b) {
	        return divide(add(a, b), 2);
	    };

	    /**
	     * Get the projection of vector a onto vector b
	     *
	     * @param {Vector} a The first vector
	     * @param {Vector} b The second vector
	     * @returns The projection vector of a onto b
	     *
	     * @todo Add assertion for non-zero length b vector
	     */
	    const proj = function(a, b) {
	        return multiply(b, dot(a, b) / Math.pow(magnitude(b), 2));
	    };

	    /**
	     * Get the angle between two vectors
	     *
	     * @param {Vector} a The frist vector
	     * @param {Vector} b The second vector
	     * @returns The angle between vector a and vector b
	     */
	    const angleBetween = function(a, b) {
	        return Math.acos(dot(a, b) / (magnitude(a) * magnitude(b)));
	    };

	    /**
	     * Get the euclidean distance between two vectors
	     *
	     * @param {Vector} a The first vector
	     * @param {Vector} b The second vector
	     * @returns The euclidean distance between a and b
	     * @see {@link distSquared}
	     */
	    const distance = function(a, b) {
	        return Math.sqrt(distSquared(a, b));
	    };

	    /**
	     * Get the euclidean distnace squared between two vectors.
	     * This is used as a helper for the distnace function but can be used
	     * to save on speed by not doing the square root operation.
	     *
	     * @param {Vector} a The first vector
	     * @param {Vector} b The second vector
	     * @returns The euclidean distance squared between vector a and vector b
	     * @see {@link distnace}
	     */
	    const distSquared = function(a, b) {
	        const dx = a[0] - b[0];
	        const dy = a[1] - b[1];
	        return dx * dx + dy * dy;
	    };

	    /**
	     * Get the shortest distance between the point p and the line
	     * segment v to w.
	     *
	     * @param {Vector} p The vector point
	     * @param {Vector} v The first line segment endpoint
	     * @param {Vector} w The second line segment endpoint
	     * @returns The shortest euclidean distance between point
	     * @see {@link distToSeg2}
	     * @see {@link http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment}
	     */
	    const distToSeg = function(p, v, w) {
	        return Math.sqrt(distToSegSquared(p, v, w));
	    };

	    /**
	     * Get the shortest distance squared between the point p and the line
	     * segment v to w.
	     *
	     * @param {Vector} p The vector point
	     * @param {Vector} v The first line segment endpoint
	     * @param {Vector} w The second line segment endpoint
	     * @returns The shortest euclidean distance squared between point
	     * @see {@link distToSeg}
	     * @see {@link http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment}
	     */
	    const distToSegSquared = function(p, v, w) {
	        const l = distSquared(v, w);
	        if (l === 0) {
	            return distSquared(p, v);
	        }
	        let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l;
	        t = Math.max(0, Math.min(1, t));
	        return distSquared(
	            p, Vector(v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]))
	        );
	    };

	    /**
	     * Get the two normal vectors that are perpendicular to the current vector
	     *
	     * @param {Vector} vec The vector to find the perpendiculars from
	     * @returns {Vector[]} The two normal vectors that are perpendicular
	     *  to the vector. The first vector is the normal vector that is +90 deg or
	     *  +PI/2 rad. The second vector is the noraml vector that is -90 deg or
	     *  -PI/2 rad.
	     */
	    const perpendiculars = function(vec) {
	        const plus90 = Vector(-vec[1], vec[0]).normalize();
	        const minus90 = Vector(vec[1], -vec[0]).normalize();
	        return [plus90, minus90];
	    };

	    //---- Standard Static Vector Objects ----

	    /**
	     * Get a vector of no magnitude and no direction
	     *
	     * @returns {Vector} Vector of magnitude zero
	     */
	    const zero = function() {
	        return [0, 0];
	    };

	    /**
	     * Get the unit vector pointing in the positive y direction
	     *
	     * @returns {Vector} Unit vector pointing up
	     */
	    const up = function() {
	        return [0, 1];
	    };

	    /**
	     * Get the unit vector pointing in the negative y direction
	     *
	     * @returns {Vector} Unit vector pointing down
	     */
	    const down = function() {
	        return [0, -1];
	    };

	    /**
	     * Get the unit vector pointing in the negative x direction
	     *
	     * @returns {Vector} Unit vector pointing right
	     */
	    const left = function() {
	        return [-1, 0];
	    };

	    /**
	     * Get the unit vector pointing in the positive x direction
	     *
	     * @returns {Vector} Unit vector pointing right
	     */
	    const right = function() {
	        return [1, 0];
	    };

	    return {
	        Vector: Vector,
	        Polar: Polar,
	        equals: equals,
	        toString: toString,
	        copy: copy,
	        magnitude: magnitude,
	        magSquared: magSquared,
	        angle: angle,
	        clamp: clamp,
	        add: add,
	        subtract: subtract,
	        multiply: multiply,
	        divide: divide,
	        normalize: normalize,
	        rotate: rotate,
	        inverse: inverse,
	        dot: dot,
	        avg: avg,
	        cross: cross,
	        midpoint: midpoint,
	        proj: proj,
	        angleBetween: angleBetween,
	        distance: distance,
	        distSquared: distSquared,
	        distToSeg: distToSeg,
	        distToSegSquared: distToSegSquared,
	        perpendiculars: perpendiculars,
	        zero: zero,
	        up: up,
	        down: down,
	        left: left,
	        right: right,
	    };

	}());

	var lineclip_1 = lineclip;

	lineclip.polyline = lineclip;
	lineclip.polygon = polygonclip;


	// Cohen-Sutherland line clippign algorithm, adapted to efficiently
	// handle polylines rather than just segments

	function lineclip(points, bbox, result) {

	    var len = points.length,
	        codeA = bitCode(points[0], bbox),
	        part = [],
	        i, a, b, codeB, lastCode;

	    if (!result) result = [];

	    for (i = 1; i < len; i++) {
	        a = points[i - 1];
	        b = points[i];
	        codeB = lastCode = bitCode(b, bbox);

	        while (true) {

	            if (!(codeA | codeB)) { // accept
	                part.push(a);

	                if (codeB !== lastCode) { // segment went outside
	                    part.push(b);

	                    if (i < len - 1) { // start a new line
	                        result.push(part);
	                        part = [];
	                    }
	                } else if (i === len - 1) {
	                    part.push(b);
	                }
	                break;

	            } else if (codeA & codeB) { // trivial reject
	                break;

	            } else if (codeA) { // a outside, intersect with clip edge
	                a = intersect(a, b, codeA, bbox);
	                codeA = bitCode(a, bbox);

	            } else { // b outside
	                b = intersect(a, b, codeB, bbox);
	                codeB = bitCode(b, bbox);
	            }
	        }

	        codeA = lastCode;
	    }

	    if (part.length) result.push(part);

	    return result;
	}

	// Sutherland-Hodgeman polygon clipping algorithm

	function polygonclip(points, bbox) {

	    var result, edge, prev, prevInside, i, p, inside;

	    // clip against each side of the clip rectangle
	    for (edge = 1; edge <= 8; edge *= 2) {
	        result = [];
	        prev = points[points.length - 1];
	        prevInside = !(bitCode(prev, bbox) & edge);

	        for (i = 0; i < points.length; i++) {
	            p = points[i];
	            inside = !(bitCode(p, bbox) & edge);

	            // if segment goes through the clip window, add an intersection
	            if (inside !== prevInside) result.push(intersect(prev, p, edge, bbox));

	            if (inside) result.push(p); // add a point if it's inside

	            prev = p;
	            prevInside = inside;
	        }

	        points = result;

	        if (!points.length) break;
	    }

	    return result;
	}

	// intersect a segment against one of the 4 lines that make up the bbox

	function intersect(a, b, edge, bbox) {
	    return edge & 8 ? [a[0] + (b[0] - a[0]) * (bbox[3] - a[1]) / (b[1] - a[1]), bbox[3]] : // top
	           edge & 4 ? [a[0] + (b[0] - a[0]) * (bbox[1] - a[1]) / (b[1] - a[1]), bbox[1]] : // bottom
	           edge & 2 ? [bbox[2], a[1] + (b[1] - a[1]) * (bbox[2] - a[0]) / (b[0] - a[0])] : // right
	           edge & 1 ? [bbox[0], a[1] + (b[1] - a[1]) * (bbox[0] - a[0]) / (b[0] - a[0])] : // left
	           null;
	}

	// bit code reflects the point position relative to the bbox:

	//         left  mid  right
	//    top  1001  1000  1010
	//    mid  0001  0000  0010
	// bottom  0101  0100  0110

	function bitCode(p, bbox) {
	    var code = 0;

	    if (p[0] < bbox[0]) code |= 1; // left
	    else if (p[0] > bbox[2]) code |= 2; // right

	    if (p[1] < bbox[1]) code |= 4; // bottom
	    else if (p[1] > bbox[3]) code |= 8; // top

	    return code;
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
	  // Calculate the bbox endpoints
	  const in_angle = angle % Math.PI;
	  const rect = parseRect_1(bbox);
	  const rectList = [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height];
	  const tl = [rect.x,              rect.y              ];
	  const tr = [rect.x + rect.width, rect.y              ];
	  const bl = [rect.x,              rect.y + rect.height];
	  const br = [rect.x + rect.width, rect.y + rect.height];

	  // Calculate the rectangle properties
	  const top_corner = in_angle > Math.PI/2 ? tl : tr;
	  const bottom_corner = in_angle > Math.PI/2 ? br : bl;
	  const rect_diag = [top_corner, bottom_corner];
	  const diag_distance = Vector.distance(rect_diag[0], rect_diag[1]);

	  // Calculate information to create the refrence line for the hatching
	  const line_angle = in_angle + Math.atan(rect.height, rect.width);
	  const line_distance = diag_distance;
	  const num_lines = Math.floor(Math.abs(line_distance / spacing));

	  const hatches = newArray_1(num_lines).map((_, i) => {
	    const vector_offset = Vector.Polar(spacing * (i+1), line_angle);
	    const hatch_point = in_angle > Math.PI/2 ?
	    Vector.subtract(top_corner, vector_offset) :
	      Vector.add(top_corner, vector_offset);

	    const unclipped_hatch = [
	      Vector.add(hatch_point, Vector.Polar(width, line_angle - Math.PI / 2)),
	      Vector.add(hatch_point, Vector.Polar(width, line_angle + Math.PI / 2)),
	    ];

	    const clipped_hatch = lineclip_1(unclipped_hatch, rectList);

	    // biproduct of lineclip library. The library adds an extra list around answer
	    return clipped_hatch.length > 0 ? clipped_hatch[0] : clipped_hatch;
	  });

	  return hatches.filter((hatch) => hatch.length > 0);
	}

	return boundingboxCrosshatching;

})));
