# @compass-aiden/telegram
> 基于Ky封装的Http请求模块

## Getting Started

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
const instance1 = http.get(); // url,[query],[options] /api/user/:userId
const instance2 = http.head(); // url,[query],[options]
const instance3 = http.post(); // url,[params],[options]
const instance4 = http.put(); // url,[params],[options]
const instance5 = http.patch(); // url,[params],[options]
const instance6 = http.delete(); // url,[params],[options]
const instance7 = http.request(); // url,[options]
instance1.abort() // 终止请求
instance1.then().cache() // 处理请求

// 链式调用
http
  .chain()
  .get('/api/user/:userId') // 指定get方法及url
  .path('userId', '0001') // 指定路径数据
  .domain() // 指定域,不使用则默认default
  .config() // 单独处理此请求的配置
  .disable() // 禁用特定选项,可以禁用当前域的 请求拦截器/响应拦截器/
  .addHooks() // 针对此请求设置请求拦截器
  .request(); // Promise<any> & { abort: () => void } // 执行请求
```

## 项目开发

### 安装依赖

`npm install`

### 本地开发模式

`npm dev` 将在本地3000端口启动服务,入口为当前目录下的index.html文件

### 代码风格校验

`npm run lint` 执行代码Eslint检查

### 单元测试

`npm run test` 执行单元测试,匹配 `src/**/*.spec.ts`

### 构建发布包

`npm run build` 构建产物
