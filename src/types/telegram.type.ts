import {
  Options as KyOptions,
  ResponsePromise as KyResponsePromise,
} from 'ky';

export interface TelegramCoreOption extends Exclude<
KyOptions, 'method' | 'json' | 'parseJson' | 'searchParams' | 'onDownloadProgress'
> {
}

export interface TelegramRequestOption extends KyOptions {
  domain?: string
  pathParams?: Record<string, string>
}

export interface TelegramResponsePromise extends KyResponsePromise {
  abort: () => void
}
