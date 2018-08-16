import parseRect from 'parse-rect';
import newArray from 'new-array';
import Vector from 'vector';

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
export default function boundingboxCrosshatching(bbox, spacing, angle=Math.PI) {
  // Calculate the bbox endpoints
  const in_angle = angle % Math.PI;
  const rect = parseRect(bbox);
  const tl = [rect.x,              rect.y              ];
  const tr = [rect.x + rect.width, rect.y              ];
  const bl = [rect.x,              rect.y + rect.height];
  const br = [rect.x + rect.width, rect.y + rect.height];

  // Calculate the rectangle properties
  const top_corner = in_angle < Math.PI/2 ? tl : tr;
  const bottom_corner = in_angle < Math.PI/2 ? br : bl;
  const rect_diag = [top_corner, bottom_corner];
  const diag_distance = Vector.distance(rect_diag[0], rect_diag[1]);

  // Calculate information to create the refrence line for the hatching
  const line_angle = Math.PI/4 - in_angle - Math.atan(rect.height, rect.width);
  const line_distance = diag_distance * Math.cos(line_angle);
  const num_lines = Math.floor(Math.abs(line_distance / spacing));

  const hatches = newArray(num_lines).map((_, i) => {
    const vector_offset = Vector.Polar(spacing * (i+1), line_angle);
    const hatch_point = Vector.add(top_corner, vector_offset);

    return [
      Vector.subtract(hatch_point, Vector.Polar(width / 2, line_angle - Math.PI / 2)),
      Vector.subtract(hatch_point, Vector.Polar(width / 2, line_angle + Math.PI / 2)),
    ];
  });

  return hatches;
}