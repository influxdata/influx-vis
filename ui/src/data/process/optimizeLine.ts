import { newTable, Table } from "@influxdata/giraffe";
import { range, sorting, sortWithInverse, zip } from "../../util/utils";


export type optimizeTableParams = {
  table: Table,
  targetPointsPerLine?: number,
  groupByCols?: string[],
};

const defaults: Required<Omit<optimizeTableParams, "table">> = {
  targetPointsPerLine: 500,
  groupByCols: ["_field"],
}

/**
 * returns array of object containing each unique key with all indexes where is key present in array
 */
const groupBySameIndexes = (keys: string[]): { key: string, indexes: number[] }[] => {
  const obj: { [key: string]: number[] } = {};

  for (let i = 0; i < keys.length; i++) {
    const elm = keys[i];
    const entry = obj[elm];
    if (entry) {
      entry.push(i);
    } else {
      obj[elm] = [i];
    }
  }

  return Object.entries(obj).map(([key, indexes]) => ({ key, indexes }));
};

const distFromLine = (x1: number, y1: number, x2: number, y2: number, px: number, py: number): number => {
  const x2m1 = x2 - x1;
  const y2m1 = y2 - y1;
  return Math.abs((x2m1) * (y1 - py) - (x1 - px) * (y2m1)) / Math.sqrt(((x2m1) ** 2) + ((y2m1) ** 2));
}

const giraffeTableKeepRows = (t: Table, keep: boolean[]) => {
  const columnKeys = t.columnKeys;
  const columnFluxTypes = columnKeys.map(x => t.getOriginalColumnType(x)!)
  const columnTypes = columnKeys.map(x => t.getColumnType(x)!)
  const columnNames = columnKeys.map(x => t.getColumnName(x)!)

  const columns = columnKeys.map(x => t.getColumn(x)!);

  const newColumns = columns.map(x => [] as any[]);

  for (let i = 0; i < keep.length; i++) {
    const k = keep[i];
    if (!k) continue;
    columns.forEach((col, coli) => {
      newColumns[coli].push((col as any)[i]);
    })
  }

  let table = newTable(keep.filter(x => x).length);
  columnKeys.forEach((key, coli) => {
    table = table.addColumn(key, columnFluxTypes[coli], columnTypes[coli], newColumns[coli], columnNames[coli]);
  })
  return table;
}

export const optimizeTable = (params: optimizeTableParams): Table => {
  const { groupByCols, table, targetPointsPerLine } = { ...defaults, ...params };

  // if (table.length <= targetPointsPerLine) return table;

  const time = table.getColumn("_time", "number") as number[] || [];
  const values = table.getColumn("_value", "number") as number[] || [];

  const keysColumns = groupByCols.map(x => table.getColumn(x,) as number[] | string[])
  const getKey = (i: number) => {
    const keys = keysColumns
      .map(x => x?.[i] || "")
      .map(x => typeof x === "number" ? x.toString() : x)
      .reduce((a, b) => `${a} ${b}`, "")
      ;

    return keys;
  };

  const keys = range(table.length).map(getKey);

  const grouped = groupBySameIndexes(keys);

  // which rows from table to keep
  const keep = range(table.length).map(() => false);

  grouped.forEach(({ indexes, key }) => {
    const scopedTime = indexes.map(i => time[i]);
    const scopedValues = indexes.map(i => values[i]);

    const { sorted: scopedTimeSorted, inverse, same } = sortWithInverse(scopedTime, sorting.number.ascending);
    const scopedValuesSorted = same(scopedValues);
    const lineScopedSorted = zip(scopedTimeSorted, scopedValuesSorted).map(([x, y]) => ({ x, y }));

    const keepScopedSorted = optimizeLine({ line: lineScopedSorted, targetPoints: targetPointsPerLine });
    const keepScoped = inverse(keepScopedSorted);

    indexes.forEach((i, ii)=> keep[i] = keepScoped[ii])
    // keepScoped.forEach((x, i) => keep[indexes[i]] = x);
  });

  const newTable = giraffeTableKeepRows(table, keep);
  return newTable;
};

type optimizeLineProps = {
  line: { x: number, y: number }[],
  targetPoints: number,
}
/** 
 * for given line, returns which points to keep
 */
export const optimizeLine = (props: optimizeLineProps): boolean[] => {
  const { line, targetPoints } = { ...props };
  if (targetPoints >= line.length)
    return line.map(() => true);

  const keep = line.map(() => false);
  const distances = line.map(() => -Infinity)

  const calculateDistBetweenI = (i0: number, i1: number) => {
    distances[i0] = -Infinity;
    distances[i1] = -Infinity;
    const [p0, p1] = [line[i0], line[i1]];

    const dist = distFromLine.bind(undefined, p0.x, p0.y, p1.x, p1.y);

    for (let i = i0 + 1; i < i1; i++) {
      const p = line[i];
      distances[i] = dist(p.x, p.y);
    }
  }

  // always keep side points
  keep[0] = true;
  keep[keep.length - 1] = true;

  calculateDistBetweenI(0, keep.length - 1)

  for (let i = 0; i < targetPoints; i++) {
    // todo: faster way, save index during searching for max
    const maxDist = Math.max(...distances);
    const maxDisti = distances.findIndex(x => x === maxDist);

    keep[maxDisti] = true;
    // find left point that we keep from max dist point
    let iLower = maxDisti;
    while (!keep[--iLower]) { }
    calculateDistBetweenI(iLower, maxDisti);
    // find right point that we keep from max dist point
    let iUpper = maxDisti;
    while (!keep[++iUpper]) { }
    calculateDistBetweenI(maxDisti, iUpper);
  }

  return keep;
}


