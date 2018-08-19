(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.polygonCrosshatching = factory());
}(this, (function () { 'use strict';

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

  /**
       * Returns the intersection of two line segments. If there is no
       * intersection, then the function returns null
       * 
       * @static
       * @param {number[][2]} line1 The first line
       * @param {number[][2]} line2 The second line
       * @return {number[2] | false} The vector intersection point or flase if there
       *   is no intersection point
       * @memberof Line
       * @see {@link https://www.swtestacademy.com/intersection-convex-polygons-algorithm/}
       */
  var lineSegmentIntersection = function intersection(line1, line2) {
    const l1_p1 = line1[0];
    const l1_p2 = line1[1];
    const l2_p1 = line2[0];
    const l2_p2 = line2[1];
    const A1 = l1_p2[1] - l1_p1[1];
    const B1 = l1_p1[0] - l1_p2[0];
    const C1 = A1 * l1_p1[0] + B1 * l1_p1[1];

    const A2 = l2_p2[1] - l2_p1[1];
    const B2 = l2_p1[0] - l2_p2[0];
    const C2 = A2 * l2_p1[0] + B2 * l2_p1[1];

    const det = A1 * B2 - A2 * B1;
    if (fequals(det, 0)) {
      return [];
    }
    else {
      const x = (B2 * C1 - B1 * C2) / det;
      const y = (A1 * C2 - A2 * C1) / det;

      const onLine1 = (Math.min(l1_p1[0], l1_p2[0]) < x || fequals(Math.min(l1_p1[0], l1_p2[0]), x)) &&
                      (Math.max(l1_p1[0], l1_p2[0]) > x || fequals(Math.max(l1_p1[0], l1_p2[0]), x)) &&
                      (Math.min(l1_p1[1], l1_p2[1]) < y || fequals(Math.min(l1_p1[1], l1_p2[1]), y)) &&
                      (Math.max(l1_p1[1], l1_p2[1]) > y || fequals(Math.max(l1_p1[1], l1_p2[1]), y));

      const onLine2 = (Math.min(l2_p1[0], l2_p2[0]) < x || fequals(Math.min(l2_p1[0], l2_p2[0]), x)) &&
                      (Math.max(l2_p1[0], l2_p2[0]) > x || fequals(Math.max(l2_p1[0], l2_p2[0]), x)) &&
                      (Math.min(l2_p1[1], l2_p2[1]) < y || fequals(Math.min(l2_p1[1], l2_p2[1]), y)) &&
                      (Math.max(l2_p1[1], l2_p2[1]) > y || fequals(Math.max(l2_p1[1], l2_p2[1]), y));

      if (onLine1 && onLine2) {
        return [x, y];
      }
    }
    return [];

    /**
     * Compare two floating point numbers for equality
     * 
     * @export
     * @param {numeric} float1 First floating point number
     * @param {numeric} float2 Second floating point number
     * @return {bool} True if the two points are (almost) equal
     */
    function fequals(float1, float2) {
      return Math.abs(float1 - float2) < Number.EPSILON;
    }
  };

  /**
   * Fill a convex polygon with crosshatching defined by a particular spacing and at
   * a particular angle.
   * 
   * @export
   * @param {Line[]} polygon The polygon to fill with crosshatching
   * @param {number} spacing The density of the crosshatching
   * @param {number} angle The angle that the crosshatching is created
   */
  function polygonCrosshatching(polygon, spacing, angle=Math.PI) {
    // Calculate the bbox endpoints
    const in_angle = angle % Math.PI;
    const poly_segments = polygon.map((vertex, index, array) => {
      const next_vertex = array[(index + 1) % array.length];
      return [vertex, next_vertex];
    });

    const rect = {
      min_x : Math.min(...polygon.map((vert) => vert[0])),
      min_y : Math.min(...polygon.map((vert) => vert[1])),
      max_x : Math.max(...polygon.map((vert) => vert[0])),
      max_y : Math.max(...polygon.map((vert) => vert[1])),
    };
    const tl = [rect.min_x, rect.min_y];
    const tr = [rect.max_x, rect.min_y];
    const bl = [rect.min_x, rect.max_y];
    const br = [rect.max_x, rect.max_y];

    // Calculate the rectangle properties
    const top_corner = in_angle > Math.PI/2 ? tl : tr;
    const bottom_corner = in_angle > Math.PI/2 ? br : bl;
    const rect_diag = [top_corner, bottom_corner];
    const diag_distance = Vector.distance(rect_diag[0], rect_diag[1]);

    // Calculate information to create the refrence line for the hatching
    const line_angle = in_angle + Math.atan(rect.max_y - rect.min_y, rect.max_x - rect.min_x);
    const line_distance = diag_distance;
    const num_lines = Math.floor(Math.abs(line_distance / spacing));

    const hatches = newArray_1(num_lines).map((_, i) => {
      // Iterate down the reference line
      const vector_offset = Vector.Polar(spacing * (i+1), line_angle);
      const hatch_point = in_angle > Math.PI/2 ?
      Vector.subtract(top_corner, vector_offset) :
        Vector.add(top_corner, vector_offset);

      // Created the single hatch mark perpendicular to the reference line
      const unclipped_hatch = [
        Vector.add(hatch_point, Vector.Polar(width, line_angle - Math.PI / 2)),
        Vector.add(hatch_point, Vector.Polar(width, line_angle + Math.PI / 2)),
      ];

      return poly_segments.reduce((acc, seg) => {
        const intersection = lineSegmentIntersection(seg, unclipped_hatch);
        return intersection.length > 1 ? acc.concat([intersection]) : acc;
      }, []);
    });

    return hatches.filter((hatch) => hatch.length > 1);
  }

  return polygonCrosshatching;

})));
