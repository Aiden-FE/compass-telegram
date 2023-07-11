import merge from 'lodash-es/merge';
import {
  HttpTelegram,
  HttpTelegramInstance,
  HttpTelegramReqConfig,
  HttpTelegramResponse,
  TelegramConstructor
} from '@/interfaces';
import TelegramChain from "@/telegram-chain";
import {replaceURLParams} from "@/utils";

const DEFAULT_DOMAIN = Symbol('default');

/**
 * @todo
 *  1. 请求体编码处理
 *  2. 请求取消
 *  3. 请求domain隔离
 *  4. 请求自动重试
 *  5. 支持跳过拦截器
 *  6. chain链式调用支持
 */
export default class TelegramCore {
  private domainMap = new Map<string | symbol, HttpTelegramReqConfig>();
  private vm: HttpTelegramInstance;

  constructor(option?: TelegramConstructor) {
    const defaultOption: HttpTelegramReqConfig = merge(
      {
        timeout: 1000 * 10,
        headers: {
          'Content-Type': 'application/json',
        },
      },
      option || {},
    );
    this.vm = HttpTelegram.create(defaultOption);
    this.domainMap.set(DEFAULT_DOMAIN, defaultOption);

    /** 应用拦截器 */
    if (option?.interceptors?.request) {
      this.vm.interceptors.request.use(option.interceptors.request, option.interceptors.requestError);
    }
    if (option?.interceptors?.response) {
      this.vm.interceptors.response.use(option.interceptors.response, option.interceptors.responseError);
    }
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
    const cloneConfig = merge({
      signal: controller.signal,
      method: 'get',
    } as HttpTelegramReqConfig, defaultConfig, config)

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
