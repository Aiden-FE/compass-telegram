import merge from 'lodash-es/merge';
import {
  HttpTelegram,
  HttpTelegramRetry,
  HttpTelegramInstance,
  HttpTelegramReqConfig,
  HttpTelegramResponse,
  TelegramConstructor,
} from '@/interfaces';
import TelegramChain from '@/telegram-chain';
import { replaceURLParams } from '@/utils';

const DEFAULT_DOMAIN = Symbol('default');

export default class TelegramCore {
  private domainMap = new Map<string | symbol, HttpTelegramReqConfig>();

  private vm: HttpTelegramInstance;

  constructor(option?: TelegramConstructor) {
    const defaultOption: HttpTelegramReqConfig = merge(
      {
        timeout: 1000 * 10,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        responseType: 'json',
      },
      option || {},
    );
    this.vm = HttpTelegram.create(defaultOption);
    HttpTelegramRetry(this.vm);
    this.domainMap.set(DEFAULT_DOMAIN, defaultOption);
  }

  chain() {
    return new TelegramChain(this.request.bind(this));
  }

  register(domain: string | symbol, option: HttpTelegramReqConfig) {
    this.domainMap.set(domain, option);
    return this;
  }

  unregister(domain: string | symbol) {
    this.domainMap.delete(domain);
    return this;
  }

  request<Result = any>(config: HttpTelegramReqConfig): Promise<HttpTelegramResponse<Result>> & { abort: Function } {
    let defaultConfig: HttpTelegramReqConfig | undefined;
    // 设置domain
    if (config.domain) {
      defaultConfig = this.domainMap.get(config.domain);
    }

    // @ts-ignore
    const controller = new AbortController();
    const cloneConfig: HttpTelegramReqConfig = merge(
      {
        signal: controller.signal,
        method: 'get',
      },
      defaultConfig,
      config,
    );

    // 替换路径path参数
    if (cloneConfig.paths) {
      cloneConfig.url = replaceURLParams(cloneConfig.url || '', cloneConfig.paths);
    }

    const task = this.vm.request<Result>(cloneConfig);

    return Object.assign(task, {
      abort: () => controller.abort(),
    });
  }
}
