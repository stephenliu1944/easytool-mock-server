# fake-http
For front-end developers who need a quick back-end for fake data.

README: [English](https://github.com/stephenliu1944/mock-server/blob/master/README.md) | [简体中文](https://github.com/stephenliu1944/mock-server/blob/master/README-zh_CN.md)
## Features
- fake data
- fake file download
- Matching by request URL and method
- Custom Response delay, status and headers
- Support third-party simulation data lib, like Mock.js and Faker.js

## Install
```
npm install -D fake-http
```

## Usage
### 1. Write fake data in source directory
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

### 2. Start fake server
```js
fake-http ./data
```

### 3. Request URL
```js
http://localhost:3000/user/1
```

## CLI 
```js
fake-http [options] <source>

Options:
  --config, -c       Path to config file
  --host, -H         Set host                             [default: "localhost"]
  --port, -p         Set port                                    [default: 3000]
  --watch, -w        Watch file(s)                                     [boolean]
  --static, -s       Set static(download) files directory
```

## Config
### Data format
You could add any js file or folder to source directory. Nested files are supported and use DFS.
```js
{
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
fake-http ./data --config=fake.config.js
```

fake.config.js
```js
var path = require('path');

module.exports = {
    host: 'localhost',          // default
    port: 3000,                 // default
    watch: false,               // default
    // store resources directory
    staticPath: path.resolve(__dirname, './static'),    // optional
    // search order with fake data files.
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
### Fake data
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
fake-http ./data
```

### Fake file download
POST http://localhost:3000/download/sample
./data
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
        body: 'sample.txt'      // store download file sample.txt to static directory(use --static argument to set).
    }
}];
```

```js
fake-http ./data --static=./static
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