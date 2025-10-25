import useSWR, { preload } from "swr";
import type { KeyedMutator, SWRConfiguration, SWRResponse } from "swr";

import useSWRInfinite, { type SWRInfiniteResponse } from "swr/infinite";
import { Client } from "./client";
import { type FilterBox, filterToQuery } from "./filters";

export abstract class UseCase {
  constructor(
    // this should not be here because it's a redunant dependency
    public readonly client: Client,
    public readonly endpoint: string,
    public readonly routeType: "admin" | "user" | "auth" | "public" = "admin",
  ) {}

  useSwr<B>(
    func: (action: this) => Route<B>,
    condition = true,
  ): (conf?: SWRConfiguration<B, unknown>) => SWRResponse<B> {
    return (conf?: SWRConfiguration<B, unknown>) => {
      if (!condition)
        return useSWR(
          () => undefined,
          () => Promise.reject(),
        );

      const { submit, route, request } = func(this);

      return useSWR(route, submit, conf);
    };
  }

  useSwrInfinite<B>(
    pageSize: number,
    func: (action: this, skip: number, limit: number) => Route<B>,
    condition = true,
  ): () => SWRInfiniteResponse<B, unknown> {
    return () => {
      return useSWRInfinite(
        (pageIndex, previousPageData) => {
          if (
            previousPageData &&
            Array.isArray(previousPageData) &&
            !previousPageData.length
          )
            return null;
          if (!condition) return null;

          const { request } = func(this, pageIndex * pageSize, pageSize);

          const { request: nextRequest } = func(
            this,
            (pageIndex + 1) * pageSize,
            pageSize,
          );

          void preload(nextRequest, (request) =>
            this.client.submit(request),
          ).then();

          return request;
        },
        (request) => this.client.submit(request),
        {
          parallel: true,
        },
      );
    };
  }

  useMultipleSwr<B, P>(
    params: Array<P>,
    func: (action: this, param: P) => Route<B>,
    condition = true,
  ): (
    conf?: SWRConfiguration<
      Array<{
        param: P;
        data: B;
      }>,
      unknown
    >,
  ) => SWRResponse<
    Array<{
      param: P;
      data: B;
    }>
  > {
    return (
      conf?: SWRConfiguration<
        Array<{
          param: P;
          data: B;
        }>,
        unknown
      >,
    ) => {
      if (!condition)
        return useSWR(
          () => undefined,
          () => Promise.reject(),
        );

      const mappedParams: [P, Route<B>][] = params.map((p) => [
        p,
        func(this, p),
      ]);

      return useSWR(
        () =>
          condition
            ? mappedParams.map((it) => [it[0], it[1].route])
            : undefined,
        () =>
          Promise.all(
            mappedParams.map(async ([param, it]) => ({
              param,
              data: await it.submit(),
            })),
          ) as Promise<
            Array<{
              param: P;
              data: B;
            }>
          >,
        conf,
      );
    };
  }

  // the first function will fetch a list of items
  // then for each item, the second function will make a request
  useDoubleSwr<B extends unknown[], C, BItem extends B[number]>(
    first: (action: this) => Route<B>,
    second: (action: this, first: BItem, client: Client) => Route<C>,
    condition = true,
  ): (
    conf?: SWRConfiguration<
      Array<{
        param: BItem;
        data: C;
      }>,
      unknown
    >,
  ) => SWRResponse<
    Array<{
      param: BItem;
      data: C;
    }>
  > & {
    mutateFirst: KeyedMutator<B>;
  } {
    return (
      conf?: SWRConfiguration<
        Array<{
          param: BItem;
          data: C;
        }>,
        unknown
      >,
    ) => {
      const { data, mutate } = this.useSwr<B>(
        first,
        condition,
      )(conf as unknown as SWRConfiguration<B, unknown>);

      const u = this.useMultipleSwr<C, BItem>(
        (data as unknown as Array<BItem> | undefined) ?? [],
        (action, param) => second(action, param as BItem, this.client),
        !data || !condition ? false : Boolean(data),
      )(conf);

      return {
        ...u,
        mutateFirst: mutate,
      };
    };
  }
}

export type Route<T> = {
  submit: () => Promise<T>;
  route: string;
  request: Request;
};

export class Action<T> extends UseCase {
  all(filter?: FilterBox<Partial<T>>): Route<Array<T>> {
    const { operation } = this.client.prepare<Array<T>>(
      this.endpoint,
      "GET",
      filterToQuery(filter),
      undefined,
    );
    return operation;
  }

  one(id: string): Route<T> {
    const route = this.endpoint + "/:id";
    const { operation } = this.client.prepare<T>(
      route,
      "GET",
      undefined,
      {
        id,
      },
      {
        route: this.routeType,
      },
    );
    return operation;
  }

  create(data: Omit<T, "id">): Route<T> {
    const { operation } = this.client.prepare<T>(
      this.endpoint,
      "POST",
      data,
      undefined,
      {
        route: this.routeType,
      },
    );
    return operation;
  }

  update(id: string, product: Omit<Partial<T>, "id">): Route<T> {
    const route = this.endpoint + "/:id";
    const { operation } = this.client.prepare<T>(
      route,
      "PATCH",
      product,
      {
        id,
      },
      {
        route: this.routeType,
      },
    );
    return operation;
  }

  delete(id: string): Route<T> {
    const route = this.endpoint + "/:id";
    const { operation } = this.client.prepare<T>(
      route,
      "DELETE",
      undefined,
      {
        id,
      },
      {
        route: this.routeType,
      },
    );
    return operation;
  }
}
