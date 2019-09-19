var fs = require('fs');
var path = require('path');
var requireS = require('require-from-string');

// 'content-type' to 'Content-Type'
function toBigCamel(str = '') {
    return str.replace(/([A-Za-z0-9])+-?/g, (match, p1, offset) => {        
        return match.slice(0, 1).toUpperCase() + match.slice(1).toLowerCase();
    });
}

function formatContentType(obj = {}) {
    var newObj = {};
    for (let key in obj) {
        newObj[toBigCamel(key)] = obj[key];
    }

    return newObj;
}
// 将路径语法转为正则表达式, 支持以下语法:
// :id, 匹配任意数字, 英文, 下划线, 中横线, 句号, 如: '/user/:name', matches /user/michael and /user/ryan
// *,   匹配任意数字, 英文, 下划线, 中横线, 如: '/files/*.*', matches /files/hello.jpg and /files/hello.html
// **,  匹配任意数字, 英文, 下划线, 中横线, 句号, 斜杠, 如: '/**/*.jpg', matches /files/hello.jpg and /files/path/to/file.jpg
function convertPathSyntaxToReg(pathSyntax) {
    var reg = pathSyntax.replace(/\//g, '\\/')  // / 替换为 \/ 
        .replace(/\./g, '\\.')                  // . 替换为 \. 
        .replace(/\*{2,}/g, '[\\w-\.\/]\+')     // 1个以上的 * 替换为 "\w-\.\/", 可跨层级.           
        .replace(/\*/g, '[\\w-]\+')             // 1个 * 替换为 "\w-", 不可跨层级.      
        .replace(/:[\w-\.]+/g, '[\\w-\.]\+');   // : 开头的字符串替换为 "\w-\.", 不可跨层级.      
    
    return eval('/^' + reg + '$/');             // 字符串转化为正则表达式
}

function isMatchingItem(req = {}, item = {}) {
    var { url: itemURL, method: itemMethod, protocol: itemProtocol, headers: itemHeaders } = Object.assign({}, item, item.request);
    var { path: reqURL, method: reqMethod, protocol: reqProtocol, headers: reqHeaders } = req;

    if (!itemURL) {
        throw (`Missing "url" option in ${JSON.stringify(item)}.`);
    }

    reqURL = reqURL.replace(/^\//, '').replace(/\/$/, '');          // 移除开头和末尾的 "/"
    itemURL = itemURL.replace(/^\//, '').replace(/\/$/, '');        // 移除开头和末尾的 "/"
    var reg = convertPathSyntaxToReg(itemURL);
    
    // 对比 url
    if (reqURL.toLowerCase() !== itemURL.toLowerCase() && !reg.test(reqURL)) {
        return false;
    }

    // 对比 method
    if (itemMethod && itemMethod.toLowerCase() !== reqMethod.toLowerCase()) {
        return false;
    }

    // 对比 protocol
    if (itemProtocol && itemProtocol.toLowerCase() !== reqProtocol.toLowerCase()) {
        return false;
    }

    // TODO: 对比 headers
    /* 
    if (itemHeaders && reqHeaders) {
        Object.keys(reqHeaders).some();
    } 
    */

    return true;
}

function getMatchingItem(req, filePath) {
    // 不直接使用 require() 为避免缓存
    let mockData = [];
    let file = fs.readFileSync(filePath, 'utf-8');

    // 处理 js 文件
    if (/.js$/.test(filePath)) {
        mockData = requireS(file) || [];
    // 处理 json 文件
    } else if (/.json$/.test(filePath)) {
        mockData = JSON.parse(file);
    }

    if (typeof mockData === 'object' && !Array.isArray(mockData)) {
        mockData = [mockData];
    }

    return mockData.find(item => isMatchingItem(req, item));
}

function searchMatchingItem(req, sourcePath, searchOrder) {
    var filenames;
    
    try {
        filenames = fs.readdirSync(sourcePath);
    } catch (e) {
        throw (`Can not find any source files in "${sourcePath}".`);
    }
    
    if (filenames && filenames.length > 0) {
        let matchingData;
        // 文件排序
        if (searchOrder) {
            filenames = searchOrder(filenames) || [];
        }
        // 遍历所有 mock 数据
        for (let i = 0; i < filenames.length; i++) {
            let filename = filenames[i];
            let filePath = path.join(sourcePath, filename);
            let fileStat = fs.statSync(filePath);
            
            // 是文件则对比请求与文件中的 mock 数据是否匹配
            if (fileStat.isFile()) {
                matchingData = getMatchingItem(req, filePath);
                // 是目录则继续递归
            } else if (fileStat.isDirectory()) {
                matchingData = searchMatchingItem(req, filePath, searchOrder);
            }
            // 如果找到了则返回, 未找到继续递归查找.
            if (matchingData) {
                return matchingData;
            }
        }
    }    
}

module.exports = {
    formatContentType,
    searchMatchingItem
};