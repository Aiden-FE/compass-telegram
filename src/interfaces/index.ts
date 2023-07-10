import { AxiosResponse, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios';

/** 类型代理,隔绝对底层实现的访问 */
export {
  default as HttpTelegram,
  AxiosInstance as HttpTelegramInstance,
  AxiosRequestConfig as HttpTelegramReqConfig,
} from 'axios';

export interface TelegramConstructor {
  /**
   * @default { timeout: 1000 * 10, headers: { 'Content-Type': 'application/json', }, }
   */
  config?: CreateAxiosDefaults;
  interceptors?: {
    request?:
      | ((value: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>)
      | null;
    requestError?: ((error: any) => any) | null;
    response?: ((value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>) | null;
    responseError?: ((error: any) => any) | null;
  };
}
