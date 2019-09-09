var fs = require('fs');
var app = require('express')();
var merge = require('lodash/merge');
var enableDestroy = require('server-destroy');
var defaultSettings = require('./defaults');
var { formatContentType, searchMatchingItem } = require('../utils/common');

const watcherList = [];

function getSettings(configFile) {
    if (!fs.existsSync(configFile)) {
        return;
    }

    var settings = require(configFile);

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
            // 1. TODO: staticPath 如果没有配置则抛出错误
            // 2. TODO: 支持远程文件传输
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

function watchDirectories(directories = [], callback) {
    directories.forEach((dir) => {
        if (fs.existsSync(dir)) {
            var watcher = fs.watch(dir, (eventType, filename) => {
                console.log('eventType: ', eventType, filename);
                callback && callback();
            });
            watcherList.push(watcher);
        }
    });
}

function startup(options = {}, config) {
    const {
        host, 
        port, 
        watch,      
        sourcePath, 
        staticPath, 
        searchOrder,
        response: defaultResponse
    } = merge({}, defaultSettings, getSettings(config), options);  // 注意: defaultSettings.response.headers 格式

    if (!sourcePath) {
        throw('sourcePath option is required.');
    }

    app.use(function(req, res, next) {
        // 从 mock data 数据源中找到匹配的数据
        var mockDataItem = searchMatchingItem(req.path, req.method, sourcePath, searchOrder);
        if (mockDataItem) {
            let mockResponse = mockDataItem.response;
            if (mockResponse.headers) {
                mockResponse.headers = formatContentType(mockResponse.headers);
            }
            let response = merge({}, defaultResponse, mockResponse);
            sendResponse(response, staticPath, res, next);
        } else {
            next();
        }
    });
    
    app.use(function(err, req, res, next) {
        console.log(req.url, 404, err);
        res.status(404);
        res.send(err.message);
    });
    
    var server = app.listen(port, host, function() {
        console.info('Mock Server listening on port ' + port);
    });

    // enhance with a 'destroy' function
    enableDestroy(server);

    if (watch) {
        watchDirectories([config, sourcePath, staticPath], () => {
            // TODO: diff(), 是否有变化, 没变化不重启
            server && server.destroy();
            watcherList.forEach((watcher) => watcher.close());
            watcherList.length = 0;

            startup(options, config);
        });
    }

    return server;
}

module.exports = {
    startup
};