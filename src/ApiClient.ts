import { merge } from "lodash";
interface ApiClientOptions {
  mock?: unknown;
  guest?: boolean;
  responseType?: "blob" | "json";
}

export interface ApiClientResponse<T> extends Response {
  data: T;
}

class ApiClientError extends Error {
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}

interface ApiClientBeforeRequestCallback {
  (options: RequestInit, requestOptions: ApiClientOptions): RequestInit;
}
interface ApiClientAfterRequestCallback {
  (
    options: RequestInit,
    requestOptions: ApiClientOptions,
    result: Response
  ): void;
}
interface ApiClientOnRequestErrorCallback {
  (
    options: RequestInit,
    requestOptions: ApiClientOptions,
    result: Response,
    error: unknown
  ): void;
}

async function mockResponse<T>(mock: unknown): Promise<ApiClientResponse<T>> {
  if (typeof mock === "function") {
    return {
      ...new Response(),
      data: (await mock()) as T,
    };
  } else {
    return {
      ...new Response(),
      data: mock as T,
    };
  }
}

export class ApiClient {
  private _baseUrl: string;
  private _baseOptions: RequestInit;
  private _beforeRequest: ApiClientBeforeRequestCallback = (opt) => {
    return opt;
  };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _afterRequest: ApiClientAfterRequestCallback = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onRequestError: ApiClientOnRequestErrorCallback = () => {};

  constructor(
    baseUrl = "",
    baseOptions: RequestInit = {
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    }
  ) {
    this._baseUrl = baseUrl;
    this._baseOptions = baseOptions;
  }

  public set endpoint(url: string) {
    this._baseUrl = url;
  }
  public set beforeRequest(callBack: ApiClientBeforeRequestCallback) {
    this._beforeRequest = callBack;
  }
  public set afterRequest(callBack: ApiClientAfterRequestCallback) {
    this._afterRequest = callBack;
  }
  public set onRequestError(callBack: ApiClientOnRequestErrorCallback) {
    this._onRequestError = callBack;
  }

  private async performRequest<T>(
    url: string,
    fetchOptions: RequestInit = {},
    requestOptions: ApiClientOptions = {}
  ): Promise<ApiClientResponse<T>> {
    if (requestOptions.mock) {
      return await mockResponse<T>(requestOptions.mock);
    }

    const merged: RequestInit = merge({}, this._baseOptions, fetchOptions);

    const options: RequestInit = this._beforeRequest(merged, requestOptions);

    let response: Response = new Response();
    try {
      response = await fetch(`${this._baseUrl}${url}`, options);
      if (!response.ok)
        throw new ApiClientError(
          `Response finished with status ${response.status} - ${response.statusText}`,
          response
        );

      let result: T;
      if (response.status !== 204) {
        if (requestOptions.responseType === "blob") {
          result = (await response.blob()) as unknown as T;
        } else {
          try {
            result = await response.json();
          } catch {
            result = null as unknown as T;
          }
        }
      } else {
        result = null as unknown as T;
      }
      this._afterRequest(options, requestOptions, response);

      return {
        ...response,
        data: result,
      };
    } catch (e) {
      this._onRequestError(options, requestOptions, response, e);
      if (e instanceof ApiClientError) {
        throw e;
      }
      if (e instanceof Error) {
        throw e;
      }
      throw e;
    }
  }

  async fetch(url: string, options: RequestInit = {}) {
    return fetch(`${this._baseUrl}${url}`, options);
  }

  async get<T>(
    url: string,
    fetchOptions: RequestInit = {},
    requestOption: ApiClientOptions = {}
  ): Promise<ApiClientResponse<T>> {
    const options: RequestInit = {
      ...fetchOptions,
      method: "GET",
    };
    console.log({ url, options, requestOption });

    return this.performRequest<T>(url, options, requestOption);
  }

  async delete<T>(
    url: string,
    fetchOptions: RequestInit = {},
    requestOption: ApiClientOptions = {}
  ): Promise<ApiClientResponse<T>> {
    const options: RequestInit = {
      ...fetchOptions,
      method: "DELETE",
    };
    return this.performRequest<T>(url, options, requestOption);
  }

  async head<T>(
    url: string,
    fetchOptions: RequestInit = {},
    requestOption: ApiClientOptions = {}
  ): Promise<ApiClientResponse<T>> {
    const options: RequestInit = {
      ...fetchOptions,
      method: "HEAD",
    };
    return this.performRequest<T>(url, options, requestOption);
  }

  async options<T>(
    url: string,
    fetchOptions: RequestInit = {},
    requestOption: ApiClientOptions = {}
  ): Promise<ApiClientResponse<T>> {
    const options: RequestInit = {
      ...fetchOptions,
      method: "OPTIONS",
    };
    return this.performRequest<T>(url, options, requestOption);
  }

  async post<T>(
    url: string,
    body: FormData | unknown | null,
    fetchOptions: RequestInit = {},
    requestOption: ApiClientOptions = {}
  ): Promise<ApiClientResponse<T>> {
    let parsedBody: string | FormData | null = null;
    if (body instanceof FormData) {
      parsedBody = body;
    } else if (body != null) {
      parsedBody = JSON.stringify(body);
    }

    const options: RequestInit = {
      ...fetchOptions,
      body: parsedBody,
      method: "POST",
    };
    return this.performRequest<T>(url, options, requestOption);
  }

  async put<T>(
    url: string,
    body: FormData | unknown | null,
    fetchOptions: RequestInit = {},
    requestOption: ApiClientOptions = {}
  ): Promise<ApiClientResponse<T>> {
    let parsedBody: string | FormData | null = null;
    if (body instanceof FormData) {
      parsedBody = body;
    } else if (body != null) {
      parsedBody = JSON.stringify(body);
    }

    const options: RequestInit = {
      ...fetchOptions,
      body: parsedBody,
      method: "PUT",
    };
    return this.performRequest<T>(url, options, requestOption);
  }

  async patch<T>(
    url: string,
    body: FormData | unknown | null,
    fetchOptions: RequestInit = {},
    requestOption: ApiClientOptions = {}
  ): Promise<ApiClientResponse<T>> {
    let parsedBody: string | FormData | null = null;
    if (body instanceof FormData) {
      parsedBody = body;
    } else if (body != null) {
      parsedBody = JSON.stringify(body);
    }

    const options: RequestInit = {
      ...fetchOptions,
      body: parsedBody,
      method: "PATCH",
    };
    return this.performRequest<T>(url, options, requestOption);
  }
}
