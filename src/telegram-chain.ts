import merge from 'lodash-es/merge';
import {HttpTelegramReqConfig} from "@/interfaces";
import type TelegramCore from "@/telegram-core";

export default class TelegramChain {
  private option: HttpTelegramReqConfig = {};

  constructor(private req: TelegramCore['request']) {}

  request<Result = any>() {
    return this.req<Result>(this.option);
  }

  retry(option: number | HttpTelegramReqConfig['retry']) {
    if (typeof option === 'number') {
      this.option.retry = {
        max: option,
        delay: 1000,
      };
    } else {
      this.option.retry = option;
    }
    return this;
  }

  path(key: string, value: string) {
    this.option.paths = {
      ...this.option.paths,
      [key]: value,
    };
    return this;
  }

  domain(domain: string | symbol) {
    this.option.domain = domain;
    return this;
  }

  searchParams(params: any) {
    this.option.params = params;
    return this;
  }

  body(data: any) {
    this.option.data = data;
    return this;
  }

  config(config: Partial<HttpTelegramReqConfig>) {
    this.option = merge({
      ...this.option,
      ...config,
    });
    return this;
  }

  get(url: string) {
    this.option.url = url;
    this.option.method = 'get';
    return this;
  }
  post(url: string) {
    this.option.url = url;
    this.option.method = 'post';
    return this;
  }
  delete(url: string) {
    this.option.url = url;
    this.option.method = 'delete';
    return this;
  }
  put(url: string) {
    this.option.url = url;
    this.option.method = 'put';
    return this;
  }
  head(url: string) {
    this.option.url = url;
    this.option.method = 'head';
    return this;
  }
  options(url: string) {
    this.option.url = url;
    this.option.method = 'options';
    return this;
  }
  patch(url: string) {
    this.option.url = url;
    this.option.method = 'patch';
    return this;
  }
  purge(url: string) {
    this.option.url = url;
    this.option.method = 'purge';
    return this;
  }
  link(url: string) {
    this.option.url = url;
    this.option.method = 'link';
    return this;
  }
  unlink(url: string) {
    this.option.url = url;
    this.option.method = 'unlink';
    return this;
  }
}
