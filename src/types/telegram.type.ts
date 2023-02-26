import {
  Options as KyOptions,
  ResponsePromise as KyResponsePromise,
} from 'ky';
import { TelegramChainDisableType } from '@/types/telegram-chain.type';

export interface TelegramCoreOption extends Exclude<
KyOptions, 'method' | 'json' | 'parseJson' | 'searchParams' | 'onDownloadProgress'
> {
}

export interface TelegramRequestOption extends KyOptions {
  domain?: string
  pathParams?: Record<string, string>
  disabledOptions?: TelegramChainDisableType[]
}

export interface TelegramResponsePromise extends KyResponsePromise {
  /**
   * @description 取消本次请求
   */
  abort: () => void
}
