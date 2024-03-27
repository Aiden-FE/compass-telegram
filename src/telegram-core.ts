import merge from 'lodash-es/merge';
import {
  HttpTelegram,
  HttpTelegramRetry,
  HttpTelegramInstance,
  HttpTelegramReqConfig,
  TelegramConstructor,
  HttpTelegramReqInterceptor,
  HttpTelegramInternalReqConfig,
  HttpTelegramResInterceptor,
  HttpTelegramInterceptorsMap,
  HttpTelegramErrorInterceptor,
} from '@/interfaces';
import TelegramChain from '@/telegram-chain';
import { executeReqInterceptorsSerially, executeResInterceptorsSerially, replaceURLParams } from '@/utils';

const DEFAULT_DOMAIN = Symbol('default');

export default class TelegramCore {
  private domainMap = new Map<string | symbol, HttpTelegramReqConfig>();

  private reqInterceptorsMap: HttpTelegramInterceptorsMap<HttpTelegramReqInterceptor> = new Map();

  private resInterceptorsMap: HttpTelegramInterceptorsMap<HttpTelegramResInterceptor> = new Map();

  private readonly vm: HttpTelegramInstance;

  constructor(option?: TelegramConstructor) {
    this.registerInterceptors('req', DEFAULT_DOMAIN, {
      onFulfilled: option?.interceptors?.request,
      onRejected: option?.interceptors?.requestError,
    });
    this.registerInterceptors('res', DEFAULT_DOMAIN, {
      onFulfilled: option?.interceptors?.response,
      onRejected: option?.interceptors?.responseError,
    });

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

    // @ts-ignore
    delete defaultOption.interceptors;

    this.vm = HttpTelegram.create(defaultOption);
    HttpTelegramRetry(this.vm);
    this.bindInterceptors();
    this.domainMap.set(DEFAULT_DOMAIN, defaultOption);
  }

  chain() {
    return new TelegramChain(this.request.bind(this));
  }

  register(domain: string | symbol, option: TelegramConstructor) {
    this.registerInterceptors('req', domain, {
      onFulfilled: option?.interceptors?.request,
      onRejected: option?.interceptors?.requestError,
    });
    this.registerInterceptors('res', domain, {
      onFulfilled: option?.interceptors?.response,
      onRejected: option?.interceptors?.responseError,
    });

    // eslint-disable-next-line no-param-reassign
    delete option.interceptors;

    this.domainMap.set(
      domain,
      merge(
        {
          timeout: 1000 * 10,
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          responseType: 'json',
        },
        option,
      ),
    );
    return this;
  }

  unregister(domain: string | symbol) {
    this.domainMap.delete(domain);
    this.reqInterceptorsMap.delete(domain);
    this.resInterceptorsMap.delete(domain);
    return this;
  }

  request<Result = any>(config: HttpTelegramReqConfig): Promise<Result> & { abort: Function } {
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

    // 经拦截器处理后的Result不一定是AxiosResponse
    const task = this.vm.request<Result>(cloneConfig) as Promise<Result>;

    return Object.assign(task, {
      abort: () => controller.abort(),
    });
  }

  private registerInterceptors<Type extends 'req' | 'res'>(
    type: Type,
    domain: string | symbol,
    interceptors: {
      onFulfilled?:
        | (HttpTelegramReqInterceptor | HttpTelegramResInterceptor)
        | (HttpTelegramReqInterceptor | HttpTelegramResInterceptor)[];
      onRejected?: HttpTelegramErrorInterceptor;
    },
  ) {
    if (type === 'req') {
      let fulfilled: HttpTelegramReqInterceptor[] = [];
      if (interceptors.onFulfilled) {
        fulfilled = Array.isArray(interceptors.onFulfilled)
          ? (interceptors.onFulfilled as HttpTelegramReqInterceptor[])
          : ([interceptors.onFulfilled] as HttpTelegramReqInterceptor[]);
      }
      this.reqInterceptorsMap.set(domain, {
        onFulfilled: fulfilled,
        onRejected: interceptors.onRejected,
      });
      return;
    }
    let fulfilled: HttpTelegramResInterceptor[] = [];
    if (interceptors.onFulfilled) {
      fulfilled = Array.isArray(interceptors.onFulfilled)
        ? (interceptors.onFulfilled as HttpTelegramResInterceptor[])
        : ([interceptors.onFulfilled] as HttpTelegramResInterceptor[]);
    }
    this.resInterceptorsMap.set(domain, {
      onFulfilled: fulfilled,
      onRejected: interceptors.onRejected,
    });
  }

  private bindInterceptors() {
    this.vm.interceptors.request.use(
      (req: HttpTelegramInternalReqConfig) => {
        const requestInterceptors = this.reqInterceptorsMap.get(req.domain || DEFAULT_DOMAIN) || {
          onFulfilled: [],
        };
        return executeReqInterceptorsSerially(requestInterceptors.onFulfilled, req);
      },
      (error) => {
        const requestInterceptors = this.reqInterceptorsMap.get(error.config?.domain || DEFAULT_DOMAIN) || {
          onFulfilled: [],
        };
        if (requestInterceptors.onRejected) {
          return requestInterceptors.onRejected(error);
        }
        throw error;
      },
    );
    this.vm.interceptors.response.use(
      (res) => {
        const responseInterceptors = this.resInterceptorsMap.get(
          (res.config as HttpTelegramInternalReqConfig).domain || DEFAULT_DOMAIN,
        ) || {
          onFulfilled: [],
        };
        return executeResInterceptorsSerially(responseInterceptors.onFulfilled, res);
      },
      (error) => {
        const responseInterceptors = this.resInterceptorsMap.get(error.config?.domain || DEFAULT_DOMAIN) || {
          onRejected: undefined,
        };
        if (responseInterceptors.onRejected) {
          return responseInterceptors.onRejected(error);
        }
        throw error;
      },
    );
  }
}
