import parseRect from 'parse-rect';
import newArray from 'new-array';
import Vector from 'vector';
import lineClip from 'lineclip';

/**
 * Fill a bounding box with crosshatching defined by a particular spacing and at
 * a particular angle.
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

    const clipped_hatch = lineClip(unclipped_hatch, rectList);

    // biproduct of lineclip library. The library adds an extra list around answer
    return clipped_hatch.length > 0 ? clipped_hatch[0] : clipped_hatch;
  });

  return hatches.filter((hatch) => hatch.length > 0);
}