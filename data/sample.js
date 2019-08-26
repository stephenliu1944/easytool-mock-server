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
}];
