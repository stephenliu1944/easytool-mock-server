var fs = require('fs');
var path = require('path');
var app = require('express')();
var merge = require('lodash/merge');
var enableDestroy = require('server-destroy');
var defaultSettings = require('./defaults');
var { formatContentType, searchMatchingItem } = require('./utils');

const watcherList = [];

function getSettings(configFile) {
    if (!fs.existsSync(configFile)) {
        return;
    }

    // 清除缓存
    delete require.cache[configFile];
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
            if (!fs.existsSync(staticPath)) {
                next(`Please set "staticPath" option and put the file "${body}" in that path.`);
            } else if (!fs.existsSync(path.join(staticPath, body))) {
                next(`Can not find file "${body}" in "${staticPath}".`);
            } else {
                // TODO: 支持远程文件传输
                res.sendFile(body, {    // 发送文件
                    root: staticPath
                }, function(err) {
                    err && next(err);
                });
            }
        } else {
            res.send(body);
        }
    }, delay);
}

function watchDirectories(directories = [], callback) {
    directories.forEach((dir) => {
        if (fs.existsSync(dir)) {
            var watcher = fs.watch(dir, (eventType, filename) => {
                callback && callback(eventType, filename);
            });
            watcherList.push(watcher);
        }
    });
}

function startup(options = {}, config) {
    const { sourcePath, ...other }  = options;
    
    if (!sourcePath) {
        throw('sourcePath option is required.');
    }

    const {
        host, 
        port, 
        watch,      
        staticPath, 
        searchOrder,
        response: defaultResponse
    } = merge({}, defaultSettings, getSettings(config), other);  // 注意: defaultSettings.response.headers 格式

    app.use(function(req, res, next) {
        try {
            var error;
            // 从 mock data 数据源中找到匹配的数据
            var mockDataItem = searchMatchingItem(req, sourcePath, searchOrder);
            if (mockDataItem) {
                let mockResponse = mockDataItem.response;
                if (mockResponse.headers) {
                    mockResponse.headers = formatContentType(mockResponse.headers);
                }
                let response = merge({}, defaultResponse, mockResponse);
                sendResponse(response, staticPath, res, next);
            } else {
                error = new Error(`No matching data could be found.`);
                error.status = 404;
                next(error);
            }
        } catch (e) {
            next(e);
        }
    });
    
    // handle error middleware
    app.use(function(error, req, res, next) {
        if (typeof error === 'string') {
            error = new Error(error);
            error.status = 500;
        }

        console.log(req.url, error.status);
        console.error(error.message);
        res.status(error.status);
        res.send(error.message);
    });
    
    var server = app.listen(port, host, function() {
        console.info('Fake Server listening on port ' + port);
    });

    // enhance with a 'destroy' function
    enableDestroy(server);

    if (watch) {
        watchDirectories([config, sourcePath, staticPath], (eventType, filename) => {
            // TODO: diff(filename), 是否有变化, 没变化不重启, 提高性能
            watcherList.forEach(watcher => watcher.close());
            watcherList.length = 0;
            server && server.destroy();
            
            startup(options, config);
        });
    }

    return server;
}

module.exports = {
    startup
};