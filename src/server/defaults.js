// 全局配置
module.exports = {
    host: 'localhost',
    port: 3000,
    watch: false, 
    searchOrder(filenames) {
        return filenames.sort();
    },
    response: {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
            // 'Cache-Control': 'no-cache',
            // 'Pragma': 'no-cache',
            // 'Expires': '-1'
        }
    }
};
