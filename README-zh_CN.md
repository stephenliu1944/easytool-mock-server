# @easytool/mock-server
该服务用于快速模拟HTTP请求数据.

README: [English](https://github.com/stephenliu1944/mock-server/blob/dev/README.md) | [简体中文](https://github.com/stephenliu1944/mock-server/blob/dev/README-zh_CN.md)
## 特性
- 模拟数据
- 模拟文件下载
- 通过请求的 URL 和 method 匹配响应信息
- 自定义响应延迟时间, 状态码, 头信息
- 支持第三方数据模拟库, 如 Mock.js 和 Faker.js
- 支持搜索不到模拟数据时, 将请求转发到代理服务

## 安装
```
npm install -g @easytool/mock-server
```

## 示例
### 1. 在存放模拟数据的目录中配置模拟数据
data/user.js
```js
module.exports = [{
    request: {
        url: '/user/:id'
    },
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            age: 30
        }
    }
}];
```

### 2. 启动服务
"./data"参数为模拟数据所在目录
```js
mock-server ./data
```

### 3. 请求 URL
```js
http://localhost:3000/user/1
```

## 命令行
```js
mock-server [options] <source>

Options:
  --config, -c       配置文件所在路径
  --host, -H         设置主机                              [default: "localhost"]
  --port, -P         设置端口号                                   [default: 3000]
  --proxy, -p        设置 http-proxy-middleware 代理                     [string]
  --watch, -w        是否监听文件变化                                   [boolean]
  --static, -s       设置静态资源(下载)文件路径
```

### 示例
```
mock-server -H localhost -P 3001 -p http://api.xxx.com ./data
```

## API
```
startup({
    host,
    port,
    proxy,           // 当mock server未找到对应模拟数据时会转到代理服务, 支持 http-proxy-middleware 配置
    watch,
    sourcePath,      // 模拟数据文件的目录
    staticPath       // 模拟下载文件的目录
}, settings)         // 全局配置
```

### 示例
```
let mockServer = require('@easytool/mock-server');

mockServer.startup({
    host: 'localhost',
    port: 3001,
    proxy: 'http://api.xxx.com' || { target: http://api.xxx.com },
    watch: true,
    sourcePath: './data',
    staticPath: './static'
});
```

## 配置
### 数据格式
可以将任何js文件添加到数据文件目录中, 支持文件嵌套, 服务器会递归查询(采用深度优先查找).
```js
{
    // 忽略该项配置
    ignore: false,              // 可选
    // 'request' 用于匹配请求, 根据请求返回对应的响应信息
    request: {  
        // 'url' 用于对比请求的URL.
        url: '/xxx/xxx',        // 必填
        // 'method' 用于 对比请求的方法, 不填则不会对比该项.
        method: 'get',          // 可选
        protocol: 'http'        // 可选
    },
    // 'response' 用于配置响应返回的信息.
    response: {             // 必填
        // 'delay' 用于设置响应的延迟时间, 默认为0毫秒.
        delay: 0,           // 默认
        // 'status' 用于设置响应的状态码, 默认为200.
        status: 200,        // 默认
        // 'headers' 用于设置响应的头信息, 下方是默认配置.
        headers: {          // 默认
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        // 'body' 用于配置响应的实体信息, 支持 string, object, array类型, 如果类型为 String 并且以 '.xxx' 后缀结尾, 则表示该配置项为一个文件路径, 且默认根目录为 "--static" 参数的值,该功能用于返回文件, 可以在默认设置文件中修改 "staticPath" 配置.
        body: {             // 必填
            ...
        }
    }
}
```

### 默认设置
可以在配置文件中修改默认配置.
```js
mock-server ./data --config=mock.config.js
```

mock.config.js
```js
var path = require('path');

module.exports = {
    host: 'localhost',                  // 默认
    port: 3000,                         // 默认
    proxy: false,                       // 默认, 支持 http-proxy-middleware 选项
    watch: false,                       // 默认
    // 遍历搜索匹配的 mock 文件的顺序, 默认按字母排序.
    searchOrder(filenames) {
        return filenames.sort();        // 默认
    },
    // 全局的响应配置, 会合并到你指定的某个具体的响应配置上.
    response: {
        headers: {                      // 默认
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
    }
}
```

### 路由
有三种模式可以匹配请求的URL.
```js
{
    request: {
        // 匹配 /user/stephen 和 /user/ricky
        url: '/user/:name',
        // 匹配 /files/hello.jpg 和 /files/world.png
        url: '/files/*.*',  
        // 匹配 /files/hello.jpg 和 /files/path/to/world.jpg
        url: '/**/*.jpg'
    },
    ...
}
```

## 示例
### 模拟接口数据
GET http://localhost:3000/user/list
```js
module.exports = [{
    request: {
        url: '/user/list',
        method: 'get'
    },
    response: {
        delay: 2000,
        body: [{
            id: 123,
            name: 'Stephen',
            age: 30
        }, {
            id: 124,
            name: 'Ricky',
            age: 20
        }]
    }
}];
```

### 模拟文件下载
POST http://localhost:3000/download/sample
```js
module.exports = [{
    request: {
        url: '/download/:filename',
        method: 'get'
    },
    response: {
        delay: 1000,
        headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment;filename=sample.txt;'
        },
        body: '<static>/sample.txt'      // 需要将模拟下载的文件保存在静态资源(static参数配置的)目录中.
    }
}];
```

### 使用 Mock.js 库
```js
npm i mockjs
```
GET http://localhost:3000/user/list
```js
var Mock = require('mockjs');

module.exports = [{
    request: {
        url: '/user/list',
        method: 'get'
    },
    response: {
        body: Mock.mock({
            'data|20': [{
                id: '@integer(0, 10000)',
                name: '@name',
                email: '@email'
            }]
        }).data
    }
}];
```
[Mock.js API](https://github.com/nuysoft/Mock/wiki)

### 使用 Faker.js 库
```js
npm i faker
```
GET http://localhost:3000/user/123  
```js
var faker = require('faker');

module.exports = [{
    request: {
        url: '/user/:id',
        method: 'get'
    },
    response: {
        body: {
            id: faker.random.uuid(),
            name: faker.name.findName(),
            email: faker.internet.email()
        }
    }
}];
```
[Faker.js API](https://github.com/Marak/Faker.js#readme)