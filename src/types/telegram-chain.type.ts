import type {
  AfterResponseHook,
  BeforeErrorHook,
  BeforeRequestHook,
  BeforeRetryHook,
} from 'ky/distribution/types/hooks';

export type TelegramChainDisableType =
  | 'defaultRequestHook'
  | 'defaultResponseHook'
  | 'defaultErrorHook'
  | 'defaultRetryHook';

export interface TelegramChainHooks {
  request: BeforeRequestHook | BeforeRequestHook[];
  response: AfterResponseHook | AfterResponseHook[];
  error: BeforeErrorHook | BeforeErrorHook[];
  retry: BeforeRetryHook | BeforeRetryHook[];
}
