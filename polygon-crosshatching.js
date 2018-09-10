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
export default function polygonCrosshatching(polygon, angle, min_density,
                                             max_density=min_density) {
  const center = Vector.avg(polygon);
  const poly_segments = polygonToSegments(polygon);
  
  const bbox = getRotatedBbox(polygon, center, angle);
  const bbox_segments = polygonToSegments(bbox);

  const bbox_diag_length = Vector.magnitude(Vector.subtract(bbox[0], bbox[2]));

  // The reference line is the line at $angle that is perpendicular to the
  // hatches which determins where the hatches are located
  const unbounded_reference_line = [
    Vector.offset(center, bbox_diag_length, -angle),
    Vector.offset(center, bbox_diag_length, Math.PI - angle),
  ];

  const bounded_reference_line = bbox_segments.reduce((acc, seg) => {
    const intersection = lineSegmentIntersection(seg, unbounded_reference_line);
    return intersection.length > 1 ? acc.concat([intersection]) : acc;
  }, []);

  return bounded_reference_line;

  // ---- Helper Functions -----------------------------------------------------

  function getRotatedBbox(polygon, center, angle) {
    const rotated_polygon = polygon.map(vertex =>
      Vector.rotate(vertex, center, angle)
    );

    const rotated_bbox_props = {
      min_x: Math.min(...rotated_polygon.map((vert) => vert[0])),
      min_y: Math.min(...rotated_polygon.map((vert) => vert[1])),
      max_x: Math.max(...rotated_polygon.map((vert) => vert[0])),
      max_y: Math.max(...rotated_polygon.map((vert) => vert[1]))
    };

    const rotated_bbox = [
      [rotated_bbox_props.min_x, rotated_bbox_props.min_y],
      [rotated_bbox_props.max_x, rotated_bbox_props.min_y],
      [rotated_bbox_props.max_x, rotated_bbox_props.max_y],
      [rotated_bbox_props.min_x, rotated_bbox_props.max_y],
    ];

    const bbox = rotated_bbox.map(vertex => {
      return Vector.rotate(vertex, center, -angle);
    });

    return bbox;
  }

  /**
   * Take a polygon that is in path form [p1, p2, p3, ... , pn] and turn it into the
   * segment form of a polygon. [ [p1, p2], [p2, p3], ... , [pn, p1] ]
   * 
   * @param polygon The input polygon in path form
   * @returns The input polygon in segment form
   */
  function polygonToSegments(polygon) {
    return polygon.map((vertex, index, array) => {
      const next_vertex = array[(index + 1) % array.length];
      return [vertex, next_vertex];
    });
  }
}