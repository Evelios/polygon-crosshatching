import newArray from 'new-array';
import Vector from 'vector';
import lineSegmentIntersection from 'line-segment-intersection';

/**
 * Fill a convex polygon with crosshatching defined by a particular spacing and at
 * a particular angle.
 * 
 * @export
 * @param {Line[]} polygon The polygon to fill with crosshatching
 * @param {number} spacing The density of the crosshatching
 * @param {number} angle The angle that the crosshatching is created
 */
export default function polygonCrosshatching(polygon, spacing, angle=Math.PI) {
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

  const hatches = newArray(num_lines).map((_, i) => {
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