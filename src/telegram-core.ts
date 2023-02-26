import merge from 'lodash-es/merge';
import cloneDeep from 'lodash-es/cloneDeep';
import set from 'lodash-es/set';
import ky, { Hooks as KyHooks } from 'ky';
import { TelegramCoreOption, TelegramRequestOption, TelegramResponsePromise } from '@/types';
import { replaceURLParams } from '@/utils';
import TelegramChain from '@/telegram-chain';

const DEFAULT_DOMAIN = '$$default$$';

export default class TelegramCore {
  private domainMap = new Map<string, TelegramCoreOption>();

  private readonly defaultOption: TelegramCoreOption = {
    headers: {
      'content-type': 'application/json',
    },
  };

  constructor(option?: Partial<TelegramCoreOption>) {
    this.defaultOption = merge(this.defaultOption, option || {});
    this.domainMap.set(DEFAULT_DOMAIN, this.defaultOption);
  }

  /**
   * @description 使用链式调用
   */
  public chain() {
    return new TelegramChain(this);
  }

  /**
   * @description 注册一个业务域配置
   * @param domain
   * @param option
   */
  public register(domain: string, option: TelegramCoreOption) {
    if (domain === DEFAULT_DOMAIN) {
      throw new TypeError('Domain cannot be set to default!');
    }
    this.domainMap.set(domain, option);
    return this;
  }

  /**
   * @description 取消注册一个业务域
   * @param domain
   */
  public unregister(domain: string) {
    if (domain === DEFAULT_DOMAIN) {
      throw new TypeError('Unable to unregister default domain');
    }
    this.domainMap.delete(domain);
    return this;
  }

  /**
   * @description 发出请求,返回一个Promise及abort方法用来取消请求
   * @param url
   * @param option
   */
  public request(url: string, option?: Partial<TelegramRequestOption>): TelegramResponsePromise {
    const cloneOption = { ...option };
    let lastURL = url;
    const domain = cloneOption?.domain || DEFAULT_DOMAIN;

    if (cloneOption?.pathParams) {
      lastURL = replaceURLParams(lastURL, cloneOption.pathParams);
    }
    delete cloneOption?.domain;
    delete cloneOption?.pathParams;
    let defaultOption = this.domainMap.get(domain) || this.domainMap.get(DEFAULT_DOMAIN) || {};
    if (cloneOption.disabledOptions?.length) {
      defaultOption = cloneDeep(defaultOption);
      cloneOption.disabledOptions.forEach((disabledType) => {
        let key: keyof KyHooks;
        switch (disabledType) {
          case 'defaultRequestHook':
            key = 'beforeRequest';
            break;
          case 'defaultResponseHook':
            key = 'afterResponse';
            break;
          case 'defaultErrorHook':
            key = 'beforeRetry';
            break;
          case 'defaultRetryHook':
            key = 'beforeError';
            break;
          default:
            throw new TypeError(`错误的Hook Type值, ${disabledType}`);
        }
        set(defaultOption, `hooks.${key}`, []);
      });
      delete cloneOption.disabledOptions;
    }
    const tempInstance = ky.create(defaultOption);
    let controller: AbortController | null = new AbortController();
    return {
      ...tempInstance(lastURL, {
        ...cloneOption || {},
        signal: controller.signal,
      }),
      abort: () => {
        controller?.abort(controller.signal.reason);
        controller = null; // 释放引用关系
      },
    };
  }

  public get(
    url: string,
    searchParams?: Record<string, string>,
    option?: Partial<TelegramRequestOption>,
  ) {
    const lastOption: Partial<TelegramRequestOption> = merge({}, option, {
      searchParams,
      method: 'get',
    });
    return this.request(url, lastOption);
  }

  public head(
    url: string,
    searchParams?: Record<string, string>,
    option?: Partial<TelegramRequestOption>,
  ) {
    const lastOption: Partial<TelegramRequestOption> = merge({}, option, {
      searchParams,
      method: 'head',
    });
    return this.request(url, lastOption);
  }

  public post(
    url: string,
    body?: BodyInit | null,
    option?: Partial<TelegramRequestOption>,
  ) {
    const lastOption: Partial<TelegramRequestOption> = merge({}, option, {
      body,
      method: 'post',
    });
    return this.request(url, lastOption);
  }

  public put(
    url: string,
    body?: BodyInit | null,
    option?: Partial<TelegramRequestOption>,
  ) {
    const lastOption: Partial<TelegramRequestOption> = merge({}, option, {
      body,
      method: 'put',
    });
    return this.request(url, lastOption);
  }

  public patch(
    url: string,
    body?: BodyInit | null,
    option?: Partial<TelegramRequestOption>,
  ) {
    const lastOption: Partial<TelegramRequestOption> = merge({}, option, {
      body,
      method: 'patch',
    });
    return this.request(url, lastOption);
  }

  public delete(
    url: string,
    body?: BodyInit | null,
    option?: Partial<TelegramRequestOption>,
  ) {
    const lastOption: Partial<TelegramRequestOption> = merge({}, option, {
      body,
      method: 'delete',
    });
    return this.request(url, lastOption);
  }
}

// const http = new TelegramCore();
// http.request('').then().catch();
// http.request('').abort();
