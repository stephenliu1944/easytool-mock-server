# @easytool/mock-server
For front-end developers who need a quick back-end for mock data.

README: [English](https://github.com/stephenliu1944/mock-server/blob/dev/README.md) | [简体中文](https://github.com/stephenliu1944/mock-server/blob/dev/README-zh_CN.md)
## Features
- mock data
- mock file download
- Matching by request URL and method
- Custom Response delay, status and headers
- Support third-party simulation data lib, like Mock.js and Faker.js
- Support forward to other api server (by http-proxy-middleware) when no matching data in mock server

## Install
```
npm install -g @easytool/mock-server
```

## Usage
### 1. Write mock data in source directory
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

### 2. Start mock server
```js
mock-server ./data
```

### 3. Request URL
```js
http://localhost:3000/user/1
```

## CLI 
```js
mock-server [options] <source>

Options:
  --config, -c       Path to config file
  --host, -H         Set host                             [default: "localhost"]
  --port, -P         Set port                                    [default: 3000]
  --proxy, -p        Set http-proxy-middleware target                   [string]
  --watch, -w        Watch file(s)                                     [boolean]
  --static, -s       Set static(download) files directory               [string]
```

### Example
```
mock-server -H localhost -P 3001 -p http://api.xxx.com ./data
```

## API
```
startup({
    host,
    port,
    proxy,           // Set http-proxy-middleware options when No matching data in mock server then will use this proxy
    watch,
    sourcePath,      // mock data file path
    staticPath       // mock download file path
}, settings)         // global config
```

### Example
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

## Config
### Mock Data Format
You could add any js file or folder to source directory. Nested files are supported and use DFS.
```js
{
    // ignore this item
    ignore: false,              // optional
    // 'request' is use for matching response data
    request: {
        // 'url' is use for compare request url.
        url: '/xxx/xxx',        // require
        // 'method' is use for compare request method.
        method: 'get',          // optional
        protocol: 'http'        // optional
    },
    // 'response' is use for set response data
    response: {             // require
        // 'delay' is use for delay response time.
        delay: 0,           // default
        // 'status' is use for delay response time.
        status: 200,        // default
        // 'headers' use for set response header. default to below.
        headers: {          // default
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        // 'body' is use for set response body, string, object and array are supported, if type to String and end with '.xxx' means this is a file path and root path is by --static argument, you can change it in default setting with "staticPath" option.
        body: {             // require
            ...
        }
    }
}
```

### Default Settings
You could configure default setting in config file.
```js
mock-server ./data --config=mock.config.js
```

mock.config.js
```js
var path = require('path');

module.exports = {
    host: 'localhost',          // default
    port: 3000,                 // default
    proxy: false,               // default, support http-proxy-middleware options
    watch: false,               // default
    // search order with mock data files.
    searchOrder(filenames) {
        return filenames.sort();    // default
    },
    // global response settings
    response: {
        // will merge to your specific response headers.
        headers: {                      // default
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
    }
}
```

### Routes
There are three pattern to match request url.
```js
{
    request: {
        // matches /user/stephen and /user/ricky
        url: '/user/:name',
        // matches /files/hello.jpg and /files/world.png
        url: '/files/*.*',  
        // matches /files/hello.jpg and /files/path/to/world.jpg
        url: '/**/*.jpg'
    },
    ...
}
```

## Example
### Mock data
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
```js
mock-server ./data
```

### Mock file download
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
        body: '<static>/sample.txt'      // store download file sample.txt to static directory(use --static argument to set).
    }
}];
```

```js
mock-server ./data --static=./static
```

### Work with Mock.js
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

### Work with Faker.js
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