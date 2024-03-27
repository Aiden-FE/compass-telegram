# @compass-aiden/telegram

> 基于 [Axios](https://axios-http.com/) 封装的Http请求模块

## Getting Started

### web项目使用

npm方式安装:

`npm install @compass-aiden/telegram`

```typescript
// 自动识别导入esm文件
import Telegram from '@compass-aiden/telegram';
// 通过别名路径导入esm文件
import Telegram from '@compass-aiden/telegram/esm';
```

浏览器script标签安装:

```html
<!-- 请根据个人需求采用unpkg或者jsdelivr链接 -->
<script src="https://unpkg.com/@compass-aiden/telegram@latest/dist/main.umd.js"></script>
<script>
  console.log(window['@compass-aiden/telegram']);
</script>
```

### node项目使用

npm方式安装:

`npm install @compass-aiden/telegram`

```typescript
// 自动导入cjs文件
const Telegram = require('@compass-aiden/telegram');

/** 在type: module启用ESM环境下,请参考如下方式 */
// 通过别名路径导入cjs文件,如果不能识别条件导出,tsconfig可设置 `{ "moduleResolution": "bundler" }`
import Telegram from '@compass-aiden/telegram/cjs';
// 自动导入默认cjs文件, 当 tsconfig 配置包含 `{ "moduleResolution": "NodeNext" }`时可用
import Telegram from '@compass-aiden/telegram';
```

### 用法演示

```typescript
import Telegram from '@compass-aiden/telegram';

/**
 * const telegram = new Telegram([option]) 注册默认域配置
 * telegram.register('domain', [option]) 注册新的domain业务域配置
 *
 * 默认域及register注册的新域基础配置都包含如下内容,可被配置项二次合并或覆盖:
 *  {
 *    timeout: 1000 * 10,
 *    headers: {
 *      'Content-Type': 'application/json;charset=utf-8',
 *    },
 *    responseType: 'json',
 *  },
 */
const api = new Telegram()
  // 注册 gatewayB 域的配置
  .register('gatewayB', {
    baseURL: 'https://api.test.com/api',
  })
  // 注册拦截器的演示域
  .register('interceptor', {
    baseURL: 'https://api.qqsuu.cn/api',
    interceptors: {
      request: [
        async (req) => {
          console.log('第一个异步拦截器Req: ', req);
          req.test = 'interceptor 1';
          return req;
        },
        (req) => {
          console.log('第二个同步拦截器Req: ', req);
          req.test2 = 'interceptor 2';
          return req;
        },
        (req) => {
          console.log('最终req为: ', req);
          return req;
        },
      ],
      requestError: (error) => {
        console.log('发生了请求前的未知异常: ', error);
        throw error;
      },
      response: [
        (data, res) => {
          if (res.config.customMeta?.skipResponseInterceptor) {
            console.log('接收到跳过拦截器的配置');
            return res;
          }
          if (res.status >= 200 && res.status < 300) {
            return data;
          }
          throw new Error('异常');
        },
        (data, res) => {
          if (res.config.customMeta?.skipResponseInterceptor) {
            console.log('接收到跳过拦截器的配置');
            return res;
          }
          if (data?.code === 200) {
            return data.data;
          }
          throw new Error(data?.msg || '业务异常');
        },
      ],
      responseError: (error) => {
        console.log('请求级异常发生', error);
        // return { test: 'test' } // 如果不throw异常,则此行会将该对象作为返回值
        throw error;
      },
    },
  })
  // 请求编码 域配置演示
  .register('serializer', {
    // 统一对请求进行编码处理
    paramsSerializer: (params) => {
      return Qs.stringify(params, { arrayFormat: 'brackets' });
    },
  });

// 使用底层API直接请求
api
  .request({
    url: 'https://api.test.com/api/demo',
  })
  .then((result) => console.log(result));

// 使用底层API采用gatewayB域直接请求并取消
// 请求取消测试
const cancelExample = api.request({
  domain: 'gatewayB', // 指定域配置
  url: 'demo',
});
cancelExample.then((result) => console.log(result));
cancelExample.abort(); // 可以在合适的时机取消未完成的请求

// 使用链式请求
api
  .chain()
  .get('https://api.test.com/api/demo')
  .request()
  .then((result) => console.log(result));

// 使用链式请求配置路径参数,url查询参数,body参数
api
  .chain()
  .get('https://api.test.com/api/:test')
  .path('test', 'dm-xjj')
  .searchParams({ type: 'json2' })
  .body({ test: 'test' })
  .request()
  .then((result) => console.log(result));

// 拦截器演示
api
  .chain()
  .domain('interceptor')
  .post('demo')
  .request()
  .then((result) => console.log(result));

// 自定义跳过拦截器
api
  .chain()
  .domain('interceptor')
  .post('demo')
  .config({ customMeta: { skipResponseInterceptor: true } })
  .request()
  .then((result) => console.log(result));

// 接口异常重试
api
  .chain()
  .post('demo')
  .retry(3)
  .request()
  .then((result) => console.log(result));

// 接口异常重试,自定义重试间隔
api
  .chain()
  .post('demo')
  .retry({
    retries: 3,
    // 自定义延时
    retryDelay: (count) => 1000 * count,
  })
  .request()
  .then((result) => console.log(result));
```

更多链式用法参考以下链的声明:

```typescript
declare class TelegramChain {
  /** 用于在链条末尾发起请求 */
  request<Result = any>(): Promise<Result> & {
    abort: Function;
  };
  /** 设置请求异常重试 */
  retry(option: number | HttpTelegramReqConfig['axios-retry']): this;
  /** 设置路径参数 */
  path(key: string, value: string): this;
  /** 批量设置路径参数 */
  paths(data: Record<string, string>): this;
  /** 采用指定业务域的配置 */
  domain(domain: string | symbol): this;
  /** 设置url参数 */
  searchParams(params: any): this;
  /** 设置请求体参数 */
  body(data: any): this;
  /** 设置请求头信息 */
  headers(headers: Partial<HttpTelegramReqConfig['headers']>): this;
  /** 设置自定义元数据 */
  customMeta(data: HttpTelegramReqConfig['customMeta']): this;
  /** 设置响应数据类型 */
  responseType(type: HttpTelegramReqConfig['responseType']): this;
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

## Contributes

### Install

`pnpm install`

### Base commands

- `pnpm dev` 启用开发模式
- `pnpm build` 生产构建
- `pnpm lint` 代码校验
- `pnpm format` 代码格式化
- `pnpm test` 执行单元测试
- `pnpm build:doc` 构建文档
