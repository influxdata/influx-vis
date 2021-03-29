export const randInt: {
  /** generates ranodm integer number */
  (maxExcluded: number): number;
  /** generates ranodm integer number */
  (minIncluded: number, maxExcluded: number): number;
} = (a: number, b?: number): number => {
  if (b === undefined)
    return Math.floor(Math.random() * a);
  else
    return Math.floor(Math.random() * (b - a)) + a;
};


export const range: {
  /** creates array with numbers from 0 to max-1 */
  (maxExcluded: number): number[];
  /** creates array with numbers from min to max-1 */
  (minIncluded: number, maxExcluded: number): number[];
} = (a: number, b?: number): number[] => {
  const arr = [];
  if (b === undefined)
    for (let i = 0; i < a; i++)
      arr.push(i);
  else
    for (let i = a; i < b; i++)
      arr.push(i);
  return arr;
};

/** zip together two arrays */
export const zip = <A, B>(arr1: A[], arr2: B[]): [A, B][] => {
  return arr1.map((k, i) => [k, arr2[i]]);
};

/** returns array with neighbour elements */
export const pairs = <T,>(arr: T[]) => zip(arr.slice(1), arr.slice(0, -1));

declare global {
  interface Array<T> {
    unique(): Array<T>;
    /**
     * faster alternative of unique for string arrays
     */
    uniqueStr(): Array<string>;

    limit(entries: number): Array<T>;
  }
}

// todo: shouldn't extend native objects 
if (!Array.prototype.unique) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.unique = function <T>(this: T[]): T[] {
    return this.filter((x, i) => this.findIndex(y => y === x) === i);
  }
  // eslint-disable-next-line no-extend-native
  Array.prototype.uniqueStr = function (this: string[]): string[] {
    const obj: { [key: string]: true } = {};
    this.forEach(x => obj[x] = true);
    return Object.keys(obj);
  }
}
if (!Array.prototype.limit) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.limit = function <T>(this: T[], entries: number) {
    return this.filter((_, i) => i < entries);
  }
}

type SorterFor<T> = NonNullable<Parameters<(T[])["sort"]>[0]>;

export const sorting = {
  number: {
    ascending: (a: number, b: number) => a - b,
    descending: (a: number, b: number) => b - a,
  } as const,
  keySelector: <T, T1>(selector: (obj: T) => T1, sorter: SorterFor<T1>): SorterFor<T> => {
    return (a, b) => sorter(selector(a), selector(b));
  },
} as const;

/**
 * Returns sorted array with given sorter. 
 * Inverse function witch apply (redo sorting) on sorted array and 'same' function which swap items same way as sorting on original array.
 */
export const sortWithInverse = <T>(arr: T[], sorter: Parameters<(T[])["sort"]>[0]): { sorted: T[], inverse: <TT>(arr: TT[]) => TT[], same: <TT>(arr: TT[]) => TT[] } => {
  const withIndex = arr.map((x, i) => [x, i] as const);
  withIndex.sort(sorter && ((a, b) => sorter(a[0], b[0])));
  const inverseIndex = withIndex.map(([_, i]) => i);
  const inverse = <TT>(arr: TT[]) => {
    if (arr.length !== inverseIndex.length)
      throw new Error("cannot reverse mapping array with different lengths");
    const newArr: TT[] = range(arr.length) as any;
    arr.forEach((x, i) => {
      newArr[inverseIndex[i]] = x;
    });
    return newArr;
  }
  const same = <TT>(arr: TT[]) => {
    if (arr.length !== inverseIndex.length)
      throw new Error("cannot reverse mapping array with different lengths");
    return inverseIndex.map(i => arr[i]);
  }
  const sorted = withIndex.map(([x]) => x);
  return { sorted, inverse, same };
}
