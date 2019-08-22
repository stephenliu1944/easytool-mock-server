# Mock Server

## Usage
### 1. Proxy request to mock server
package.json
```js
"devEnvironments": {
    "servers": {
        "local": 8080,
        "mock": 3000
    },
    "proxies": {
        "(/proxy)": "http://localhost:3000"     // proxy to mock server
    },
    ...
},
```

### 2. Set mock data
Default mock data path is "/mock/data/", you could change it in "/mock/settings.js".
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

### 3. Start mock server
```js
npm run mock
```
Or run
```js
/bin/mock.bat   // Windows
/bin/mock.sh    // Linux
```

## Data format
You could add any js data file or folder to '/mock/data/' directory.
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
        // 'body' is use for set response body, string, object and array are supported, if type to String and end with '.xxx' means this is a file path and default root path is "/mock/resources/", you can change it in "/mock/settings.js".
        // 'body' 用于配置响应的实体信息, 支持 string, object, array类型, 如果类型为 String 并且以 '.xxx' 后缀结尾, 则表示该配置项为一个文件路径, 且默认根目录为 "/mock/resources/",该功能用于返回文件, 可以在 "mock/settings.js" 中修改默认配置.
        body: {             // require
            ...
        }
    }
}
```

### URL Syntax
```js
{
    url: '/user/:name', // matches /user/stephen and /user/ricky
    url: '/files/*.*',  // matches /files/hello.jpg and /files/world.png
    url: '/**/*.jpg',   // matches /files/hello.jpg and /files/path/to/world.jpg
    ...
}
```

## Settings
You could change default setting in "/mock/settings.js"  
你可以在 "/mock/settings.js" 中修改默认配置.
```js
{
    // global response headers, with merge to your specific response headers.
    // 全局的响应headers设置, 会合并到你指定的某个响应头配置上.
    headers: {              // default
        'Mock-Data': 'true',
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    // mock data directory
    // mock 数据的文件保存目录
    dataPath: '/data',      // default
    // store resources directory
    // 保存响应返回的文件目录
    filePath: '/resources',     // default
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
        body: 'sample.txt'      // file need to save in '/mock/resources' directory. 需要将下载的文件保存在 '/mock/resources' 目录中.
    }
}];
```

### Work with Mock.js
```js
npm i -D mockjs
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
npm i -D faker
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

### Work with multiple Servers
package.json
```js
"devEnvironments": {
    "servers": {
        "local": 8080,
        "mock": 3000
    },
    "proxies": {
        "(/proxy)/user/list": "http://localhost:3000",      // this url request will proxy to mock server. the order is important.
        "(/proxy)": "http://some-domain.com"                // other will proxy to api server.
    },
    ...
},
```