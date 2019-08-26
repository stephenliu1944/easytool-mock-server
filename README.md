# Mock Server
For front-end developers who need a quick back-end for Mocking data.

README: [English](https://github.com/stephenliu1944/mock-server/blob/master/README.md) | [简体中文](https://github.com/stephenliu1944/mock-server/blob/master/README-zh_CN.md)
## Features
- Mocking data
- Mocking file download
- Matching by request URL and method
- Custom Response time, status and headers
- Support third-party simulation data lib, like Mock.js and Faker.js

## Install
```
git clone https://github.com/stephenliu1944/mock-server.git
cd mock-server
npm install
```

## Usage
### 1. Set mock server port
package.json
```js
"devEnvironments": {
    "servers": {
        "mock": 3000    // default
    },
    ...
},
```

### 2. Write mock data
Default mock data path is "/data", you could change it in "/settings.js".  
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

### 3. Start mock server
```js
npm start
```
Or run
```js
/bin/start.bat   // Windows
/bin/start.sh    // Linux
```

### 4. Request URL
```js
http://localhost:3000/user/1
```

## Config
### Data format
You could add any js file or folder to '/data' directory.  
```js
{
    // 'request' is use for matching response data
    request: {
        // 'url' is use for compare request url.
        url: '/xxx/xxx',        // require
        // 'method' is use for compare request method.
        method: 'get'           // optional
    },
    // 'response' is use for set response data
    response: {             // require
        // 'delay' is use for delay response time.
        delay: 0,           // default
        // 'status' is use for delay response time.
        status: 200,        // default
        // 'headers' use for set response header. default to below.
        headers: {          // default
            'Mock-Data': 'true',
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        // 'body' is use for set response body, string, object and array are supported, if type to String and end with '.xxx' means this is a file path and default root path is "/resources", you can change it in "/settings.js".
        body: {             // require
            ...
        }
    }
}
```

### Routes
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

### Default Settings
You could change default setting in "/settings.js"  
```js
{
    // global response settings
    response: {
        // will merge to your specific response headers.
        headers: {                      // default
            'Mock-Data': 'true',
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
    },
    // mock data directory
    dataPath: '/data',              // default
    // store resources directory
    resourcesPath: '/resources',    // default
    // search order with mock data files.
    sort(filenames) {
        return filenames.sort();    // default
    }
}
```

## Example
### Mocking data
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

### Mocking file download
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
        body: 'sample.txt'      // file need to save in '/resources' directory.
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