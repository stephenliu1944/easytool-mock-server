"use strict";

var fs = require('fs');

var path = require('path');

var app = require('express')();

var merge = require('lodash/merge');

var {
  formatObjectKey,
  searchMatchingData
} = require('../utils/common');

const defaultSettings = require('./defaults');

function sendResponse(mockResponse, staticPath, res, next) {
  var {
    delay = 0,
    status = 200,
    headers = {},
    body
  } = mockResponse;
  setTimeout(function () {
    res.set(headers);
    res.status(status); // body 类型为 string 并且以 .xxx 结尾( 1 <= x <= 5), 代表是文件路径.

    if (/\.\w{1,5}$/.test(body)) {
      // 发送文件
      res.sendFile(body, {
        root: path.join(__dirname, staticPath)
      }, function (err) {
        err && next(err);
      });
    } else {
      res.send(body);
    }
  }, delay);
}

function launch(options = {}, config = 'mock.config.js') {
  var settings;

  try {
    settings = require(path.join(__dirname, config));
  } catch (e) {
    console.error('Can not find config file.', e);
  }

  var a = {};
  var {
    host,
    port,
    watch,
    // TODO:
    sourcePath,
    staticPath,
    response: defaultResponse,
    searchOrder
  } = merge(a, defaultSettings, settings, options);
  console.log('--------------------abc:', options);
  console.log('--------------------abc:', settings);
  console.log('--------------------abc:', defaultSettings);
  console.log('--------------------abc:', a);
  defaultResponse.headers = formatObjectKey(defaultResponse.headers);
  app.use(function (req, res, next) {
    var mockDataPath = path.join(__dirname, sourcePath); // 从 mock data 数据源中找到匹配的数据

    var mockResponse = searchMatchingData(req.path, req.method, mockDataPath, searchOrder);

    if (mockResponse) {
      mockResponse.headers = formatObjectKey(mockResponse.headers);
      sendResponse(merge({}, defaultResponse, mockResponse), staticPath, res, next);
    } else {
      next();
    }
  });
  app.use(function (err, req, res, next) {
    console.log(req.url, 404);
    res.status(404);
    res.send(err.message);
  });
  return app.listen(port, host, function () {
    console.info('Mock Server listening on port ' + port);
  });
}

module.exports = launch;
launch();