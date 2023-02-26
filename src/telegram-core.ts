import merge from 'lodash-es/merge';
import ky from 'ky';
import { TelegramCoreOption, TelegramRequestOption, TelegramResponsePromise } from '@/types';
import { replaceURLParams } from '@/utils';

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
    const defaultOption = this.domainMap.get(domain) || this.domainMap.get(DEFAULT_DOMAIN) || {};
    const tempInstance = ky.create(defaultOption);
    let controller: AbortController | null = new AbortController();
    return {
      ...tempInstance(lastURL, {
        ...option || {},
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
