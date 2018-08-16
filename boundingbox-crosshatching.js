import parseRect from 'parse-rect';
import newArray from 'new-array';

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
  const rect = parseRect(bbox);
  const numLines = Math.floor((rect.width) / spacing);

  const hatches = newArray(numLines).map((_, i) => {
    return [
      [rect.x + spacing * i, rect.y],
      [rect.x + spacing * i, rect.y + rect.height]
    ];
  });

  return hatches;
}