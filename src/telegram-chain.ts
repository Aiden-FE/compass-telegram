import merge from 'lodash-es/merge';
import { HttpTelegramReqConfig } from '@/interfaces';
import type TelegramCore from '@/telegram-core';

export default class TelegramChain {
  private option: HttpTelegramReqConfig = {};

  constructor(private req: TelegramCore['request']) {}

  /** 用于在链条末尾发起请求 */
  request<Result = any>() {
    if (!this.option.url) {
      throw new Error('Must set url');
    }
    return this.req<Result>(this.option);
  }

  /** 设置请求异常重试 */
  retry(option: number | HttpTelegramReqConfig['axios-retry']) {
    if (typeof option === 'number') {
      this.option['axios-retry'] = {
        retries: option,
      };
    } else {
      this.option['axios-retry'] = option;
    }
    return this;
  }

  /** 设置路径参数 */
  path(key: string, value: string) {
    this.option.paths = {
      ...this.option.paths,
      [key]: value,
    };
    return this;
  }

  /** 批量设置路径参数 */
  paths(data: Record<string, string>) {
    this.option.paths = {
      ...this.option.paths,
      ...data,
    };
    return this;
  }

  /** 采用指定业务域的配置 */
  domain(domain: string | symbol) {
    this.option.domain = domain;
    return this;
  }

  /** 设置url参数 */
  searchParams(params: any) {
    this.option.params = params;
    return this;
  }

  /** 设置请求体参数 */
  body(data: any) {
    this.option.data = data;
    return this;
  }

  /** 设置请求头信息 */
  headers(headers: Partial<HttpTelegramReqConfig['headers']>) {
    this.option.headers = {
      ...this.option.headers,
      ...headers,
    } as HttpTelegramReqConfig['headers'];
    return this;
  }

  /** 设置自定义元数据 */
  customMeta(data: HttpTelegramReqConfig['customMeta']) {
    this.option.customMeta = {
      ...this.option.customMeta,
      ...data,
    };
    return this;
  }

  /** 设置响应数据类型 */
  responseType(type: HttpTelegramReqConfig['responseType']) {
    this.option.responseType = type;
    return this;
  }

  /** 直接设置更多的请求配置 */
  config(config: Partial<HttpTelegramReqConfig>) {
    this.option = merge({
      ...this.option,
      ...config,
    });
    return this;
  }

  /** 设置请求url,并指定为 get 请求 */
  get(url: string) {
    this.option.url = url;
    this.option.method = 'get';
    return this;
  }

  /** 设置请求url,并指定为 post 请求 */
  post(url: string) {
    this.option.url = url;
    this.option.method = 'post';
    return this;
  }

  /** 设置请求url,并指定为 delete 请求 */
  delete(url: string) {
    this.option.url = url;
    this.option.method = 'delete';
    return this;
  }

  /** 设置请求url,并指定为 put 请求 */
  put(url: string) {
    this.option.url = url;
    this.option.method = 'put';
    return this;
  }

  /** 设置请求url,并指定为 head 请求 */
  head(url: string) {
    this.option.url = url;
    this.option.method = 'head';
    return this;
  }

  /** 设置请求url,并指定为 options 请求 */
  options(url: string) {
    this.option.url = url;
    this.option.method = 'options';
    return this;
  }

  /** 设置请求url,并指定为 patch 请求 */
  patch(url: string) {
    this.option.url = url;
    this.option.method = 'patch';
    return this;
  }

  /** 设置请求url,并指定为 purge 请求 */
  purge(url: string) {
    this.option.url = url;
    this.option.method = 'purge';
    return this;
  }

  /** 设置请求url,并指定为 link 请求 */
  link(url: string) {
    this.option.url = url;
    this.option.method = 'link';
    return this;
  }

  /** 设置请求url,并指定为 unlink 请求 */
  unlink(url: string) {
    this.option.url = url;
    this.option.method = 'unlink';
    return this;
  }
}
