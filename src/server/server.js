var fs = require('fs');
var path = require('path');
var app = require('express')();
var merge = require('lodash/merge');
var defaultSettings = require('./defaults');
var { formatContentType, searchMatchingData } = require('../utils/common');

function getCustomSettings(configFile) {
    var settings;
    
    try {
        settings = require(configFile);
    } catch (e) {
        console.log('Can not find config file.');
    }

    if (settings && settings.response && settings.response.headers) {
        settings.response.headers = formatContentType(settings.response.headers);
    }

    return settings;
}

function sendResponse(mockResponse, staticPath, res, next) {
    var { delay = 0, status = 200, headers = {}, body } = mockResponse;

    setTimeout(function() {
        res.set(headers);
        res.status(status);

        // body 类型为 string 并且以 .xxx 结尾( 1 <= x <= 5), 代表是文件路径.
        if (/\.\w{1,5}$/.test(body)) {
            // 发送文件
            res.sendFile(body, {
                root: staticPath
            }, function(err) {
                err && next(err);
            });
        } else {
            res.send(body);
        }
    }, delay);
}

function startup(options = {}, config = 'mock.config.js') {
    var settings = getCustomSettings(path.resolve(config));

    var {
        host, 
        port, 
        watch,      // TODO: fs.watch
        sourcePath, 
        staticPath, 
        searchOrder,
        response: defaultResponse
    } = merge({}, defaultSettings, settings, options);  // 注意: defaultSettings.response.headers 格式

    if (!sourcePath) {
        throw('Please set source files directory first.');
    }

    app.use(function(req, res, next) {
        var mockDataPath = path.resolve(sourcePath);        
        // 从 mock data 数据源中找到匹配的数据
        var mockDataItem = searchMatchingData(req.path, req.method, mockDataPath, searchOrder);
        if (mockDataItem) {
            let mockResponse = mockDataItem.response;
            if (mockResponse.headers) {
                mockResponse.headers = formatContentType(mockResponse.headers);
            }
            let response = merge({}, defaultResponse, mockResponse);
            sendResponse(response, path.resolve(staticPath), res, next);
        } else {
            next();
        }
    });
    
    app.use(function(err, req, res, next) {
        console.log(req.url, 404);
        res.status(404);
        res.send(err.message);
    });
    
    return app.listen(port, host, function() {
        console.info('Mock Server listening on port ' + port);
    });
}

module.exports = {
    startup   
};