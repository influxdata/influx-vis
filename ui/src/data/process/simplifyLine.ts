import { sorting, range, zip } from "../../util";

export type Point = {
  y: number;
  x: number;
};

export type Line = Point[];

const distFromLine = (x1: number, y1: number, x2: number, y2: number, px: number, py: number): number => {
  const x2m1 = x2 - x1;
  const y2m1 = y2 - y1;
  return Math.abs((x2m1) * (y1 - py) - (x1 - px) * (y2m1)) / Math.sqrt(((x2m1) ** 2) + ((y2m1) ** 2));
}

type simplifyLineProps = {
  line: Line,
  targetPoints: number,
}
// todo: algorithm should not return result dependent on sizes of x-y (same line with all x := x*100 -> selected points will be same) analyze this property
/**
 * algorithm that removes less significant line points and keeps only number of target points
 */
export const simplifyLine = (props: simplifyLineProps) => {
  const { line: _line, targetPoints } = props;
  const line = [..._line].sort(sorting.keySelector((p) => p.x, sorting.number.ascending))

  if (targetPoints >= line.length)
    return { line };

  if (targetPoints <= 2) {
    return { line: [line[0], line[line.length - 1]] }
  }

  const keep = range(line.length).map((_, i) => i === 0 || i === (line.length - 1));
  const distances = keep.map(() => -Infinity);

  const calculateDistBetweenI = (i0: number, i1: number) => {
    const [p0, p1] = [line[i0], line[i1]];
    const dist = distFromLine.bind(undefined, p0.x, p0.y, p1.x, p1.y);

    for (let i = i0 + 1; i < i1; i++) {
      const p = line[i];
      distances[i] = dist(p.x, p.y);
    }
  }

  calculateDistBetweenI(0, keep.length - 1)

  const addPoint = (i: number) => {
    keep[i] = true;
    distances[i] = -Infinity;
    // todo: make interval array and search in it (array of pairs keep indexes)
    // find left point that we keep from max dist point
    let iLower = i;
    while (!keep[--iLower]) { }
    calculateDistBetweenI(iLower, i);
    // find right point that we keep from max dist point
    let iUpper = i;
    while (!keep[++iUpper]) { }
    calculateDistBetweenI(i, iUpper);
  }

  const step = () => {
    // todo: use ordered queue instead (this solution goes through all points every time - too slow)
    const maxDist = Math.max(...distances);
    const maxDisti = distances.findIndex(x => x === maxDist);

    addPoint(maxDisti)
  };

  for (let i = Math.max(targetPoints - 2, 0); i--;) {
    step();
  }

  return {
    line: zip(line, keep)
      .filter(([_point, keep]) => keep)
      .map(([point, _keep]) => point)
  };
}
