module.exports = [{
    url: '/user/123',
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            email: 'xxx@gmail.com'
        }
    }
}, {
    url: '/user/:id',
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            email: 'xxx@gmail.com'
        }
    }
}, {
    url: '/user/*.do',
    response: {
        body: {
            id: 123,
            name: 'Stephen',
            email: 'xxx@gmail.com'
        }
    }
}, {
    url: '/user/**/list',
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
