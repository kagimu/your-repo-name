declare module 'fuse.js' {
  interface FuseOptions<T> {
    isCaseSensitive?: boolean;
    distance?: number;
    findAllMatches?: boolean;
    getFn?: (obj: T, path: string) => string;
    ignoreLocation?: boolean;
    ignoreFieldNorm?: boolean;
    includeScore?: boolean;
    includeMatches?: boolean;
    keys?: (string | { name: string; weight: number })[];
    location?: number;
    minMatchCharLength?: number;
    shouldSort?: boolean;
    sortFn?: (a: { score: number }, b: { score: number }) => number;
    threshold?: number;
    useExtendedSearch?: boolean;
  }

  class Fuse<T> {
    constructor(list: ReadonlyArray<T>, options?: FuseOptions<T>);
    search(pattern: string): Array<{ item: T; score: number }>;
    setCollection(list: ReadonlyArray<T>): void;
  }

  export default Fuse;
}
