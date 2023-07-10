import merge from 'lodash-es/merge';
import { HttpTelegram, HttpTelegramInstance, HttpTelegramReqConfig, TelegramConstructor } from '@/interfaces';

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
  private vm: HttpTelegramInstance;

  constructor(option?: TelegramConstructor) {
    this.vm = HttpTelegram.create(
      merge(
        {
          timeout: 1000 * 10,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        option || {},
      ),
    );
    /** 应用拦截器 */
    if (option?.interceptors?.request) {
      this.vm.interceptors.request.use(option.interceptors.request, option.interceptors.requestError);
    }
    if (option?.interceptors?.response) {
      this.vm.interceptors.response.use(option.interceptors.response, option.interceptors.responseError);
    }
  }

  request(config: HttpTelegramReqConfig) {
    return this.vm.request(config);
  }
}
