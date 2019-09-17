var Mock = require('mockjs');
var faker = require('faker');

module.exports = [{
    request: {
        url: '/user/123'
    },
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            email: 'xxx@gmail.com'
        }
    }
}, {
    request: {
        url: '/user/:id',
        method: 'get'
    },
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            email: 'xxx@gmail.com'
        }
    }
}, {
    request: {
        url: '/user/*.do',
        method: 'get'
    },
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            email: 'xxx@gmail.com'
        }
    }
}, {
    request: {
        url: '/user/**/list',
        method: 'post'
    },
    response: {
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
}, {    // use mockjs
    request: {
        url: '/account/list',
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
}, {    // use faker
    request: {
        url: '/account/:id',
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
