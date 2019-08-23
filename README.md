# Mock Server
For front-end developers who need a quick back-end for Mocking data.

## Features
- Mocking data
- Send file
- URL and method Matching
- Custom Response time, status and headers
- Support third-party simulation data lib, like Mock.js and Faker.js

## Getting started
Clone or download project first.
将代码下载到本地.

### 1. Install
Install project dependencies.
安装项目依赖.
```js
npm install
```

### 2. Set mock server port
package.json
```js
"devEnvironments": {
    "servers": {
        "mock": 3000    // default
    },
    ...
},
```

### 3. Write mock data
Default mock data path is "/data", you could change it in "/settings.js".
默认的mock数据存放路径为"/data", 你可以在 "/settings.js" 中进行修改.
```js
module.exports = [{
    url: '/user/:id',
    method: 'get',
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            age: 30
        }
    }
}];
```

### 4. Start mock server
```js
npm start
```
Or run
```js
/bin/start.bat   // Windows
/bin/start.sh    // Linux
```

### 5. Request URL
```js
http://localhost:3000/user/1
```

## Data format
You could add any js file or folder to '/data' directory.
你可以添加任何js文件或文件夹到"/data"目录, 服务器会递归查询(采用深度优先查找).
```js
{
    // 'url' is use for compare request url.
    // 'url' 用于对比请求的URL.
    url: '/xxx/xxx',        // require
    // 'method' is use for compare request method.
    // 'method' 用于 对比请求的方法, 不填则不会对比该项.
    method: 'get',          // optional
    // 'response' is use for set response data
    // 'response' 用于配置响应返回的数据信息.
    response: {             // require
        // 'delay' is use for delay response time.
        // 'delay' 用于设置响应的延迟时间, 默认为0毫秒.
        delay: 0,           // default
        // 'status' is use for delay response time.
        // 'status' 用于设置响应的状态码, 默认为200.
        status: 200,        // default
        // 'headers' use for set response header. default to below.
        // 'headers' 用于设置响应的头信息, 下方是默认配置.
        headers: {          // default
            'Mock-Data': 'true',
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        // 'body' is use for set response body, string, object and array are supported, if type to String and end with '.xxx' means this is a file path and default root path is "/resources", you can change it in "/settings.js".
        // 'body' 用于配置响应的实体信息, 支持 string, object, array类型, 如果类型为 String 并且以 '.xxx' 后缀结尾, 则表示该配置项为一个文件路径, 且默认根目录为 "/resources",该功能用于返回文件, 可以在 "/settings.js" 中修改默认配置.
        body: {             // require
            ...
        }
    }
}
```

## Routes
```js
{
    url: '/user/:name', // matches /user/stephen and /user/ricky
    url: '/files/*.*',  // matches /files/hello.jpg and /files/world.png
    url: '/**/*.jpg',   // matches /files/hello.jpg and /files/path/to/world.jpg
    ...
}
```

## Settings
You could change default setting in "/settings.js"  
你可以在 "/settings.js" 中修改默认配置.
```js
{
    // global response headers, with merge to your specific response headers.
    // 全局的响应headers设置, 会合并到你指定的某个响应头配置上.
    headers: {                      // default
        'Mock-Data': 'true',
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    // mock data directory
    // mock 数据的文件保存目录
    dataPath: '/data',              // default
    // store resources directory
    // 保存响应返回的文件目录
    resourcesPath: '/resources',    // default
    // search order with mock data files.
    // 遍历搜索匹配的 mock 文件的顺序, 默认按字母排序.
    sort(filenames) {
        return filenames.sort();    // default
    }
}
```

## Example

### Send Data
GET http://localhost:3000/user/list
```js
module.exports = [{
    url: '/user/list',
    method: 'get',
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

### Send File
POST http://localhost:3000/download/sample
```js
module.exports = [{
    url: '/download/:filename',
    method: 'get',
    response: {
        delay: 1000,
        headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment;filename=sample.txt;'
        },
        body: 'sample.txt'      // file need to save in '/resources' directory. 需要将下载的文件保存在 '/resources' 目录中.
    }
}];
```

### Work with Mock.js
```js
npm i mockjs
```
GET http://localhost:3000/user/list
```js
var Mock = require('mockjs');

module.exports = [{
    url: '/user/list',
    method: 'get',
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

### Work with Faker.js
```js
npm i faker
```
GET http://localhost:3000/user/123  
```js
var faker = require('faker');

module.exports = [{
    url: '/user/:id',
    method: 'get',
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