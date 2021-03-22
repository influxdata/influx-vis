import { newTable, Table } from "@influxdata/giraffe";
import { range, sorting } from "../../util/utils";


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

  const table = newTable(keep.filter(x => x).length);
  columnKeys.forEach((key, coli) => {
    table.addColumn(key, columnFluxTypes[coli], columnTypes[coli], newColumns[coli], columnNames[coli]);
  })
  return table;
}

export const optimizeTable = (params: optimizeTableParams): Table => {
  const { groupByCols, table, targetPointsPerLine } = { ...defaults, ...params };

  if (table.length <= targetPointsPerLine) return table;

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
    if (indexes.length <= targetPointsPerLine) {
      indexes.forEach(x => keep[x] = true);
      return;
    }
    // scoped use local indexing - inverse mapping is mapping from current scope into table
    const { timeScoped, inverseMapping } = (() => {
      const timeScoped = indexes.map(i => ({ time: time[i], i }));
      timeScoped.sort(({ time: a }, { time: b }) => sorting.number.ascending(a, b));
      return { timeScoped: timeScoped.map(({ time }) => time), inverseMapping: timeScoped.map(({ i }) => i) };
    })();
    const valuesScoped = inverseMapping.map((i) => values[i]);

    const distances = range(timeScoped.length).map(() => 0);

    const calculateDistances = (i0: number, i1: number) => {
      distances[i0] = -Infinity;
      distances[i1] = -Infinity;
      const x1 = valuesScoped[i0];
      const y1 = timeScoped[i0];
      const x2 = valuesScoped[i1];
      const y2 = timeScoped[i1];
      const dist = distFromLine.bind(undefined, x1, y1, x2, y2);

      for (let i = i0 + 1; i < i1; i++) {
        distances[i] = dist(valuesScoped[i], timeScoped[i]);
      }
    }

    // we always keep side points
    keep[inverseMapping[0]] = true;
    keep[inverseMapping[inverseMapping.length - 1]] = true;
    calculateDistances(inverseMapping[0], inverseMapping[inverseMapping.length - 1])

    for (let i = 0; i < targetPointsPerLine; i++) {
      // todo: faster way, save index during searching for max
      const maxDist = Math.max(...distances);
      const maxDisti = distances.findIndex(x => x === maxDist);

      keep[inverseMapping[maxDisti]] = true;
      let ii = maxDisti;
      // find left point that we keep from max dist point
      while (!keep[inverseMapping[--ii]]) { }
      calculateDistances(ii, maxDisti);
      // find right point that we keep from max dist point
      while (!keep[inverseMapping[++ii]]) { }
      calculateDistances(maxDisti, ii);
    }
  })
  const newTable = giraffeTableKeepRows(table, keep);
  return newTable;
};



