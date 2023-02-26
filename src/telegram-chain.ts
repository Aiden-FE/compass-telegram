import merge from 'lodash-es/merge';
import set from 'lodash-es/set';
import { Hooks as KyHooks } from 'ky';
import { SearchParamsOption } from 'ky/distribution/types/options';
import {
  TelegramChainDisableType, TelegramChainHooks, TelegramRequestOption, TelegramResponsePromise,
} from '@/types';
import type TelegramCore from '@/telegram-core';

export default class TelegramChain {
  private url = '';

  private option: Partial<TelegramRequestOption> = {};

  constructor(private http: TelegramCore) {
  }

  /**
   * @description 链末尾执行请求
   */
  public request(): TelegramResponsePromise {
    return this.http.request(this.url, this.option);
  }

  /**
   * @description 针对本次请求设置hooks
   * @param type
   * @param hooks
   */
  public addHooks <HookType extends keyof TelegramChainHooks, Hooks = TelegramChainHooks[HookType]>(
    type: HookType,
    hooks: Hooks,
  ) {
    const hs = Array.isArray(hooks) ? hooks : [hooks];
    let key: keyof KyHooks;
    switch (type) {
      case 'request':
        key = 'beforeRequest';
        break;
      case 'response':
        key = 'afterResponse';
        break;
      case 'retry':
        key = 'beforeRetry';
        break;
      case 'error':
        key = 'beforeError';
        break;
      default:
        throw new TypeError(`错误的Hook Type值, ${type}`);
    }
    set(this.option, `hooks.${key}`, hs);
    return this;
  }

  /**
   * @description 禁用部分默认功能
   * @param disableOption
   */
  public disable(disableOption: TelegramChainDisableType | TelegramChainDisableType[]) {
    this.option.disabledOptions = Array.isArray(disableOption) ? disableOption : [disableOption];
    return this;
  }

  /**
   * @description 设置本次请求的配置
   * @param option
   */
  public config(option: Partial<TelegramRequestOption>) {
    this.option = merge({}, this.option, option);
    return this;
  }

  /**
   * @description 设置请求所属域
   * @param domain
   */
  public domain(domain: string) {
    this.option.domain = domain;
    return this;
  }

  /**
   * @description 设置请求body数据,如果是纯数据对象需要通过JSON.stringify()序列化,
   * 例如: chain().body(JSON.stringify({ test: 'test' }))
   * @param body
   */
  public body(body: BodyInit | null) {
    this.option.body = body;
    return this;
  }

  /**
   * @description 设置请求url附加的查询参数
   * @param searchParams
   */
  public searchParams(searchParams: SearchParamsOption) {
    this.option.searchParams = searchParams;
    return this;
  }

  /**
   * @description 根据key,value替换路径参数
   * @param key
   * @param value
   */
  public path(key: string, value: string) {
    this.option.pathParams = merge({}, this.option.pathParams, {
      [key]: value,
    });
    return this;
  }

  /**
   * @description 批量替换路径参数
   * @param pathParams
   */
  public paths(pathParams: Record<string, string>) {
    this.option.pathParams = merge({}, this.option.pathParams, pathParams);
    return this;
  }

  /**
   * @description 设置请求地址及请求方法为get
   * @param url
   */
  public get(url: string) {
    this.url = url;
    this.option.method = 'get';
    return this;
  }

  /**
   * @description 设置请求地址及请求方法为head
   * @param url
   */
  public head(url: string) {
    this.url = url;
    this.option.method = 'head';
    return this;
  }

  /**
   * @description 设置请求地址及请求方法为post
   * @param url
   */
  public post(url: string) {
    this.url = url;
    this.option.method = 'post';
    return this;
  }

  /**
   * @description 设置请求地址及请求方法为put
   * @param url
   */
  public put(url: string) {
    this.url = url;
    this.option.method = 'put';
    return this;
  }

  /**
   * @description 设置请求地址及请求方法为patch
   * @param url
   */
  public patch(url: string) {
    this.url = url;
    this.option.method = 'patch';
    return this;
  }

  /**
   * @description 设置请求地址及请求方法为delete
   * @param url
   */
  public delete(url: string) {
    this.url = url;
    this.option.method = 'delete';
    return this;
  }
}
