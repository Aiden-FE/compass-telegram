import { AxiosRequestConfig } from 'axios';
import HttpTelegramRetry, { type IAxiosRetryConfig } from 'axios-retry';

/** 类型代理,隔绝对底层实现的访问 */
export {
  default as HttpTelegram,
  AxiosInstance as HttpTelegramInstance,
  AxiosResponse as HttpTelegramResponse,
} from 'axios';

export { HttpTelegramRetry };

export interface HttpTelegramReqConfig extends AxiosRequestConfig {
  domain?: string | symbol;
  'axios-retry'?: IAxiosRetryConfig;
  paths?: Record<string, string>;
  /** 自定义元数据 */
  customMeta?: Record<string, unknown>;
}

export interface TelegramConstructor extends HttpTelegramReqConfig {}
