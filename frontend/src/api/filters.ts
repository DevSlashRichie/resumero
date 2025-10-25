export type StringFilter =
  | "like"
  | "eq"
  | "ne"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "not_like"
  | "none";

export type NumberFilter = "eq" | "ne" | "gt" | "gte" | "lt" | "lte";

export type DateFilter = NumberFilter;
export type DateAsString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

export interface FilterEntry<
  E = unknown,
  T = StringFilter | NumberFilter | DateAsString,
> {
  key: T | "none";
  value: E;
  // this will work as a helper for the UI components
  label?: string;
}

//
// convert all keys of T to key[gte] and key[lte] if key is typeof number, if key is typeof string, convert to key[like]
export type Filterize<T> = {
  [K in keyof T]: T[K] extends number
    ? FilterEntry<T[K], NumberFilter>[]
    : T[K] extends DateAsString
      ? FilterEntry<T[K], DateFilter>[]
      : T[K] extends string
        ? FilterEntry<T[K], StringFilter>[]
        : FilterEntry<T[K], StringFilter | NumberFilter>[];
};

export interface FilterBox<T = unknown> {
  value?: Partial<Filterize<T>>;
  order?: {
    mode: "asc" | "desc";
    field: keyof T;
  };
  limit?: number;
  skip?: number;
}

export function filterToQuery<T>(filter?: FilterBox<T>) {
  if (!filter) return undefined;

  const value = filter.value;

  const obj = Object.entries(value ?? {}).reduce(
    (acc, entry) => {
      const key = entry[0];
      const value = entry[1] as unknown as FilterEntry<string, unknown>[];

      if (Array.isArray(value)) {
        value.forEach((v) => {
          let rkey: string;
          let rvalue: string;

          if (v.key !== "none") {
            rkey = `${key}[${v.key}]`;
            rvalue = v.value;
          } else {
            rkey = key;
            rvalue = v.value;
          }

          // if the key already exists, append an array number to it
          if (acc[rkey]) {
            const lastNumber = Object.keys(acc)
              .filter((it) => it.startsWith(rkey))
              .map((it) => {
                //const lastNumber = last?.slice(-2).substring(0, 1);

                return it.split("[").pop()?.split("]")[0] ?? "-1";
              })
              .map((it) => parseInt(it))
              .sort((a, b) => a - b)
              .pop();

            const index = lastNumber ? lastNumber + 1 : 1;
            rkey += `[${index}]`;
          }

          acc[rkey] = rvalue;
        });
      }

      return acc;
    },
    {} as Record<string, unknown>,
  );

  if (filter.order) {
    obj[`order_by[${filter.order.mode}]`] = filter.order.field;
  }

  if (filter.limit) {
    obj.limit = filter.limit;
  }

  if (filter.skip) {
    obj.skip = filter.skip;
  }

  return obj;
}
