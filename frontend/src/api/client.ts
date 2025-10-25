import { buildQueryString } from "@/lib/utils";

function makeUrl(
  base: string,
  data: {
    path: string[];
    params?: Record<string, unknown>;
  },
) {
  const url = data.path.reduce(
    (acc, p) => {
      if (p === "/") {
        return acc;
      }

      if (p.startsWith("/")) return `${acc}${p}`;
      return `${acc}/${p}`;
    },
    base.endsWith("/") ? base.slice(0, -1) : base,
  );

  if (data.params) {
    let urlReplaced = url;
    Object.entries(data.params).forEach(([key, value]) => {
      urlReplaced = urlReplaced.replace(`:${key}`, String(value));
    });

    return urlReplaced;
  }

  return url;
}

export class ApiError extends Error {
  public readonly httpCode: number;

  constructor(message: string, httpCode: number) {
    super(message);
    this.httpCode = httpCode;
  }
}

export class Client {
  private readonly t: string | undefined;

  constructor(
    public readonly baseUrl: string,
    t?: string,
  ) {
    this.t = t;
  }

  get hasToken() {
    return typeof this.t !== "undefined" && this.t.length > 0;
  }

  prepare<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "OPTIONS" | "DELETE",
    body?:
      | Record<string, unknown>
      | Record<string, unknown>[]
      | FormData
      | string,
    params?: Record<string, unknown>,
    config?: {
      removeAuth?: boolean;
      credentials?: boolean;
    },
  ) {
    const route = makeUrl(this.baseUrl, {
      path: ["/"],
    });
    let url = makeUrl(route, { path: [path] });

    if (params) {
      url = makeUrl(url, {
        path: [],
        params,
      });
    }

    if (method === "GET" && body) {
      if (typeof body === "string") {
        url = `${url}?${body}`;
      } else {
        const params = buildQueryString(body as Record<string, unknown>);
        if (params.length > 0) url = `${url}?${params}`;
      }
    }

    // we need to load the additional headers

    let headers = {};

    if (!config?.removeAuth && this.t) {
      headers = {
        ...headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.t}`,
      };
    }

    const request = new Request(url, {
      method,
      body: method !== "GET" ? JSON.stringify(body) : undefined,
      headers,
    });

    return {
      request,
      operation: {
        submit: async () => {
          return await this.submit<T>(request);
        },
        route: request.url,
        request,
        map: <U>(fn: (data: T) => U) => ({
          submit: async () => {
            return fn(await this.submit<T>(request));
          },
          route: request.url,
          request,
        }),
      },
    };
  }

  async submit<T>(request: Request): Promise<T> {
    const response = await fetch(request);

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      throw new ApiError(result.message, response.status ?? 500);
    }
  }
}
