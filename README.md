# @compass-aiden/telegram

基于 [Ky](https://github.com/sindresorhus/ky) 封装的Http请求模块

## 特性

* 支持链式调用
* 支持多业务域配置
* 继承Ky的诸多特性
* 支持浏览器环境及node双端使用

## 快速上手

`npm install @compass-aiden/telegram` 安装依赖

```typescript
import Telegram from '@compass-aiden/telegram';
// 初始化模块
const http = new Telegram({/* ...options */}); // 默认的请求配置, 所有不指定domain的请求都会应用此配置
// 注册请求域配置
http.register(
  'domainA', // 可针对业务域配置特定的默认请求配置, 所有指定domain为domainA的请求都会应用domainA域的请求配置
  {}, /* domainA域的请求全局配置 */
)
  .register(/* 继续注册其他域,重复的domain会覆盖上一个 */);
http.unregister('domain') // 取消一个已注册的域

// 创建单个请求实例
const instance1 = http.get('/api/user/:userId').then().cache(); // url,[query],[options]
const instance2 = http.head().then().cache(); // url,[query],[options]
const instance3 = http.post().then().cache(); // url,[params],[options]
const instance4 = http.put().then().cache(); // url,[params],[options]
const instance5 = http.patch().then().cache(); // url,[params],[options]
const instance6 = http.delete().then().cache(); // url,[params],[options]
const instance7 = http.request().then().cache(); // url,[options]
instance1.abort() // 中止请求

// 链式调用
http
  .chain()
  .get('/api/user/:userId') // 指定get方法及url
  .path('userId', '0001') // 指定路径数据
  .domain('domainA') // 指定域,不使用则默认new Telegram时的选项
  .config() // 单独处理此请求的配置
  .disable() // 禁用特定选项,可以禁用当前域的 默认请求拦截器/默认响应拦截器/
  .addHooks() // 针对此请求设置请求拦截器
  .request() // Promise<any> & { abort: () => void } // 执行请求
  .abort(); // 中止请求
```

## 使用文档

### <div id="Telegram">Telegram 构造选项</div>

将会作为默认域的请求配置

| 属性名             | 是否必填 | 类型                                             | 默认值 | 说明                                                                                                                                           |
|-----------------|------|------------------------------------------------|-----|----------------------------------------------------------------------------------------------------------------------------------------------|
| headers         | 否    | `HeadersInit/Record<string, string/undefined>` | -   | 默认请求配置                                                                                                                                       |
| prefixUrl       | 否    | `URL/string`                                   | -   | 路径前缀                                                                                                                                         |
| retry           | 否    | `RetryOptions/number`                          | -   | 重试配置                                                                                                                                         |
| timeout         | 否    | `number/false`                                 | -   | 超时配置                                                                                                                                         |
| hooks           | 否    | `Hooks`                                        | -   | 拦截器hooks                                                                                                                                     |
| throwHttpErrors | 否    | `boolean`                                      | -   | 当在以下重定向之后，响应具有non-2xx状态代码时，抛出HTTPError。如果您不关注重定向，请将redirect选项设置为 'manual'。 如果您正在检查资源可用性并期望出现错误响应，则将此设置为false可能会很有用。 注意: 如果是false ，则返回成功，不会重试 |
| fetch           | 否    | `Function`                                     | -   | 自定义fetch的实现                                                                                                                                  |

### Telegram 实例方法

#### register(domain, option)

注册一个业务域的请求配置, domain为域名标识, option等同于 [Telegram 的构造选项](#Telegram)

#### unregister(domain)

取消一个已注册的域

#### get(url, [searchParams], [option])

发起一个 get 请求,searchParams为url查询参数, [option详见](#TelegramRequestOption)

#### head(url, [searchParams], [option])

发起一个 head 请求,searchParams为url查询参数, [option详见](#TelegramRequestOption)

#### post(url, [body], [option])

发起一个 post 请求,body为请求主体的携带数据, [option详见](#TelegramRequestOption)

#### put(url, [body], [option])

发起一个 put 请求,body为请求主体的携带数据, [option详见](#TelegramRequestOption)

#### patch(url, [body], [option])

发起一个 patch 请求,body为请求主体的携带数据, [option详见](#TelegramRequestOption)

#### delete(url, [body], [option])

发起一个 delete 请求,body为请求主体的携带数据, [option详见](#TelegramRequestOption)

#### request(url, [option])

根据配置发起一个请求, 不指定method则默认为get请求, [option详见](#TelegramRequestOption)

#### chain()

创建链式实例,详见下方 [Telegram.chain](#TelegramChain) 说明

### <div id="TelegramChain">Telegram.chain() 链式返回的链条方法</div>

#### retry(option: RetryOptions | number)

配置重试

#### addHeaders(headers: { [key:string]: string})

设置请求头

#### addHooks(hookType, hooks)

针对本次请求设置hooks

#### disable(disableOption)

禁用部分默认功能

#### config(option)

设置本次请求的配置 [option详见](#TelegramRequestOption)

#### domain(domain)

设置请求所属域

#### body(body, [isStringify=true])

设置请求主体所负载的数据,默认会对对象类型的数据进行JSON.stringify处理,无需处理isStringify=false即可关闭

#### searchParams(searchParams)

设置请求url附加的查询参数

#### path(key, value)

根据key,value替换url路径参数

#### paths(object)

批量替换路径参数

#### get(url)

设置请求地址并将请求方法设为 get

#### head(url)

设置请求地址并将请求方法设为 head

#### post(url)

设置请求地址并将请求方法设为 post

#### put(url)

设置请求地址并将请求方法设为 put

#### patch(url)

设置请求地址并将请求方法设为 patch

#### delete(url)

设置请求地址并将请求方法设为 delete

#### request()

执行本次链条的请求

### <div id="TelegramRequestOption">TelegramRequestOption</div>

继承ky.Options类型,并扩展以下选项:

* domain 指定所属业务域
* pathParams 路径参数
* disabledOption 禁用的部分配置

请注意,如果option.body希望传递对象数据应该先进行JSON.stringify序列化处理

### 取消请求

普通请求的取消: `new Telegram().request().abort()`

链式用法的取消: `new Telegram().chain().get('/demo').domain('A').request().abort()`
