import SimplexNoise from "simplex-noise";
import { range } from "../../util/utils";


// todo: date now
export type randomLineOptions = {
  /**
   * 1 all values will be defined .5 half of values will be randomly undefined
   */
  density?: number,
  /**
   * how many points will be presented
   */
  points?: number,
  lines?: number,
  noise?: boolean,
}

export const randomLine = (opts: randomLineOptions): (number | undefined)[][] => {
  const points = opts.points ?? 500_000;
  const density = opts.density ?? 1;
  const lines = opts.lines ?? 1;
  const noise = opts.noise ?? false;

  if (noise) {
    const simplex = new SimplexNoise();
    return range(lines).map(l => {
      const base = (Math.random() - .5)
      const scale = (Math.random()) * 50
      return range(points).map(p =>
        Math.random() < density
          ? simplex.noise2D((lines + l * 5) * 5, p * .05) * 3
          + simplex.noise2D(l * 5, p * .001) * scale
          + base
          : undefined
      );
    })
  }
  else {
    let y = (Math.random() - .5) * points * .02;
    return range(lines).map(() =>
      range(points).map(() => (
        y += Math.random() - .5,
        Math.random() < density ? y : undefined
      ))
    );
  }
}


export const csvFromLines = (lines: (number | undefined)[][], step = 1000) => {
  const head = `\
#group,false,false,true,true,false,false,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,long
#default,max,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,line\
`
  const maxLineLength = Math.max(...lines.map(x => x.length));

  const linesStr: string[] = [];

  const timestampStart = Date.now() - maxLineLength * step;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    let timestamp = timestampStart;
    for (let i = 0; i < maxLineLength; i++) {
      const time = new Date(timestamp).toISOString();
      const value = line[i];
      if (typeof value !== "number") continue;

      const lineStr = `,,0,${time},${time},${time},${value},line,${li}`;
      linesStr.push(lineStr);
      timestamp += step;
    }
  }

  const csv = head + linesStr.reduce((a, b) => `${a}\n${b}`, "");

  return csv;
}

