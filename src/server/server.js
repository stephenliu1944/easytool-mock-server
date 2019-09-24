var fs = require('fs');
var path = require('path');
var requireS = require('require-from-string');
var app = require('express')();
var merge = require('lodash/merge');
var enableDestroy = require('server-destroy');
var defaultSettings = require('./defaults');
var { formatContentType, searchMatchingItem } = require('./utils');

const STATIC_PATH = '<static>';
var watcherList = [];

function getSettings(configFile) {
    if (!fs.existsSync(configFile)) {
        return;
    }
    // 不直接使用 require() 为避免缓存
    var settings = requireS(fs.readFileSync(configFile, 'utf-8'));

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
                next('Please set "staticPath" option when you want to response file.');
                return;
            }

            let url = body.replace(STATIC_PATH, staticPath);

            if (!fs.existsSync(url)) {
                next(`Can not find file from "${url}".`);
            } else {
                // TODO: 支持远程文件传输
                res.sendFile(url, {    // 发送文件
                    // root: staticPath
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
    var { sourcePath, staticPath, ...other } = options;
    
    if (!sourcePath) {
        throw new Error('sourcePath option is required.');
    }

    // 注意: defaultSettings.response.headers 格式需要大写开头
    var _options = merge({}, defaultSettings, getSettings(config), other);
    var { host, port, watch } = _options;  
    app.set('options', _options);

    app.use(function(req, res, next) {
        var { searchOrder, response: defaultResponse } = app.get('options');

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
                error = new Error('No matching data could be found.');
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
        
        // eslint-disable-next-line
        console.info(req.url, error.status);
        // eslint-disable-next-line
        console.error(error.message);

        res.set({
            'Content-Type': 'text/plain',
            'Content-Disposition': 'inline'
        });
        res.status(error.status);
        res.send(error.message);
    });
    
    var server = app.listen(port, host, function() {
        // eslint-disable-next-line
        console.info('Mock Server listening on port ' + port);
    });

    // enhance with a 'destroy' function
    enableDestroy(server);

    if (watch) {
        watchDirectories([config, sourcePath, staticPath], (eventType, filename) => {
            // TODO: diff(filename), 是否有变化, 没变化不重启, 提高性能
            watcherList.forEach(watcher => watcher.close());
            watcherList.length = 0;
            server && server.destroy(() => setTimeout(() => startup(options, config), 500));
        });
    }

    return server;
}

module.exports = {
    startup
};