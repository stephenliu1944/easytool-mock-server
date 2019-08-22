// 全局配置
module.exports = {
    headers: {
        'Mock-Data': 'true',
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    dataPath: '/data',
    filePath: '/resources',
    sort(filenames) {
        return filenames.sort();
    }
};
