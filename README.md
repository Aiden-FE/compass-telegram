# @compass-aiden/telegram
> 基于 [Axios](https://axios-http.com/) 封装的Http请求模块

## Getting Started

`npm install @compass-aiden/telegram` 安装依赖

```typescript
import Telegram from '@compass-aiden/telegram';

/**
 *  注册默认配置,new Telegram([option])可以覆盖默认设置,默认如下
 *  {
 *    timeout: 1000 * 10,
 *    headers: {
 *      'Content-Type': 'application/json;charset=utf-8',
 *    },
 *    responseType: 'json',
 *  },
 */
const api = new Telegram()
  // 注册 gatewayB 域的配置,该配置继承默认配置并指定baseURL
  .register('gatewayB', {
    baseURL: 'https://api.test.com/api',
  })
  // 注册拦截器的演示域
  .register('interceptor', {
    // 请求前处理
    transformRequest: (data, headers) => {
      console.log('Req: ', data, headers);
      return data;
    },
    // 请求后处理
    transformResponse: function (...args) {
      console.log('Response: ', ...args, this);
      // 自定义跳过拦截器的key
      if (this.customMeta.skipResponseInterceptor) {
        console.log('接收到跳过拦截器的配置');
      }
      return args[0];
    }
  })
  // 请求编码 域配置演示
  .register('serializer', {
    // 统一对请求进行编码处理
    paramsSerializer: (params) => {
      return Qs.stringify(params, {arrayFormat: 'brackets'})
    },
  });

// 使用底层API直接请求
api.request({
  url: 'https://api.test.com/api/demo',
}).then((result) => console.log(result));

// 使用底层API采用gatewayB域直接请求并取消
// 请求取消测试
const cancelExample = api.request({
  domain: 'gatewayB', // 指定域配置
  url: 'demo',
});
cancelExample.then((result) => console.log(result));
cancelExample.abort(); // 可以在合适的时机取消未完成的请求

// 使用链式请求
api.chain()
  .get('https://api.test.com/api/demo')
  .request()
  .then((result) => console.log(result));

// 使用链式请求配置路径参数,url查询参数,body参数
api.chain()
  .get('https://api.test.com/api/:test')
  .path('test', 'dm-xjj')
  .searchParams({ type: 'json2' })
  .body({ test: 'test' })
  .request()
  .then((result) => console.log(result));

// 拦截器演示
api.chain()
  .domain('interceptor')
  .post('demo')
  .request()
  .then(result => console.log(result));

// 自定义跳过拦截器
api.chain()
  .domain('interceptor')
  .post('demo')
  .config({ customMeta: { skipResponseInterceptor: true } })
  .request()
  .then(result => console.log(result));

// 接口异常重试
api.chain()
  .post('demo')
  .retry(3)
  .request()
  .then(result => console.log(result));

// 接口异常重试,自定义重试间隔
api.chain()
  .post('demo')
  .retry({
    retries: 3,
    // 自定义延时
    retryDelay: (count) => 1000 * count,
  })
  .request()
  .then(result => console.log(result));
```

请求实例的链声明:

```typescript
declare class TelegramChain {
    /** 用于在链条末尾发起请求 */
    request<Result = any>(): Promise<import("axios").AxiosResponse<Result, any>> & {
        abort: Function;
    };
    /** 设置请求异常重试 */
    retry(option: number | HttpTelegramReqConfig["axios-retry"]): this;
    /** 设置路径参数 */
    path(key: string, value: string): this;
    /** 采用指定业务域的配置 */
    domain(domain: string | symbol): this;
    /** 设置url参数 */
    searchParams(params: any): this;
    /** 设置请求体参数 */
    body(data: any): this;
    /** 直接设置更多的请求配置 */
    config(config: Partial<HttpTelegramReqConfig>): this;
    /** 设置请求url,并指定为 get 请求 */
    get(url: string): this;
    /** 设置请求url,并指定为 post 请求 */
    post(url: string): this;
    /** 设置请求url,并指定为 delete 请求 */
    delete(url: string): this;
    /** 设置请求url,并指定为 put 请求 */
    put(url: string): this;
    /** 设置请求url,并指定为 head 请求 */
    head(url: string): this;
    /** 设置请求url,并指定为 options 请求 */
    options(url: string): this;
    /** 设置请求url,并指定为 patch 请求 */
    patch(url: string): this;
    /** 设置请求url,并指定为 purge 请求 */
    purge(url: string): this;
    /** 设置请求url,并指定为 link 请求 */
    link(url: string): this;
    /** 设置请求url,并指定为 unlink 请求 */
    unlink(url: string): this;
}
```

## Scripts

`npm run dev` 本地开发模式

`npm run build` 构建项目

`npm run lint` 执行代码Eslint检查

`npm run format` 执行代码格式化

`npm run test` 执行单元测试,匹配 `src/**/*.spec.ts`

`npm run clean` 清理构建产物
