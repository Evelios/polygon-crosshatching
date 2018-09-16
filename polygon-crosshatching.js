import newArray from 'new-array';
import Vector from 'vector';
import lineSegmentIntersection from 'line-segment-intersection';

/*
  There is a bug that happens at 0 and 360 degrees
 */

/**
 * Fill a convex polygon with crosshatching defined by a particular spacing and at
 * a particular angle.
 * 
 * @export
 * @param {Line[]} polygon The polygon to fill with crosshatching
 * @param {number} angle The angle that the crosshatching is created
 * @param {number} min_density The density of the crosshatching
 * @param {number} max_density The density of the crosshatching
 */
export default function polygonCrosshatching(polygon, angle, min_density,
                                             max_density=min_density) {
  console.assert(min_density > 0,
    "polygonCrosshatching : The minimum density must be greater than 0");
  console.assert(max_density > 0,
    "polygonCrosshatching : The maximum density must be greater than 0");

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

  const hatching_start_pos = bounded_reference_line[0];
  const reference_line_length = 
    Vector.distance(bounded_reference_line[0], bounded_reference_line[1]);
  const number_hatches = Math.ceil(reference_line_length / min_density);

  const hatches = newArray(number_hatches).map((_, i) => {
    // Iterate down the reference line
    const hatch_point = Vector.offset(hatching_start_pos, -i * min_density, -angle);

    // Created the single hatch mark perpendicular to the reference line
    const unclipped_hatch = [
      Vector.offset(hatch_point, bbox_diag_length, -angle + Math.PI/2),
      Vector.offset(hatch_point, bbox_diag_length, -angle - Math.PI/2),
    ];

    // Clip the hatch lines by getting the intersection points with the bounding polygon
    const clipped_hatch = poly_segments.reduce((acc, seg) => {
      const intersection = lineSegmentIntersection(seg, unclipped_hatch);
      return intersection.length > 1 ? acc.concat([intersection]) : acc;
    }, []);

    return clipped_hatch;
  });

  const good_hatches = hatches.filter((hatch) => hatch.length > 1);

  return good_hatches;


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