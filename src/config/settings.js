// 全局配置
module.exports = {
    response: {
        headers: {
            'Mock-Data': 'true',
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        }
    },
    host: 'localhost',
    port: 3000,
    dataPath: '/src/data',
    staticPath: '/src/resources',
    searchOrder(filenames) {
        return filenames.sort();
    }
};
