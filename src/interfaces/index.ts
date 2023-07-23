import type { AxiosRequestHeaders, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import HttpTelegramRetry, { type IAxiosRetryConfig } from 'axios-retry';

/** 类型代理,隔绝对底层实现的访问 */
export { default as HttpTelegram, AxiosInstance as HttpTelegramInstance } from 'axios';

export { HttpTelegramRetry };

export interface HttpTelegramReqConfig extends AxiosRequestConfig {
  domain?: string | symbol;
  'axios-retry'?: IAxiosRetryConfig;
  paths?: Record<string, string>;
  /** 自定义元数据 */
  customMeta?: Record<string, unknown>;
}

export interface HttpTelegramInternalReqConfig extends HttpTelegramReqConfig {
  headers: AxiosRequestHeaders;
}

export interface HttpTelegramResponse extends AxiosResponse {
  config: HttpTelegramInternalReqConfig;
}

// 请求拦截器
export type HttpTelegramReqInterceptor = (
  req: HttpTelegramInternalReqConfig,
) => HttpTelegramInternalReqConfig | Promise<HttpTelegramInternalReqConfig>;

// 响应拦截器
export type HttpTelegramResInterceptor = (
  data: any,
  res: HttpTelegramResponse,
) => HttpTelegramResponse | Promise<HttpTelegramResponse>;

export type HttpTelegramErrorInterceptor = (error: AxiosError) => any;

export interface TelegramConstructor extends HttpTelegramReqConfig {
  interceptors?: {
    request?: HttpTelegramReqInterceptor | HttpTelegramReqInterceptor[];
    requestError?: HttpTelegramErrorInterceptor;
    response?: HttpTelegramResInterceptor | HttpTelegramResInterceptor[];
    responseError?: HttpTelegramErrorInterceptor;
  };
}

export type HttpTelegramInterceptorsMap<
  FulfilledInterceptor extends HttpTelegramReqInterceptor | HttpTelegramResInterceptor,
> = Map<
  string | symbol,
  {
    onFulfilled: FulfilledInterceptor[];
    onRejected?: HttpTelegramErrorInterceptor;
  }
>;
