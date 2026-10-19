export function createSpeedClient(environment, options) {
  var defaults = { latencyTestUrl: '/test', downloadUrl: '/test.bin', uploadUrl: '/post', uploadDataSize: 5 * 1024 * 1024, uploadDataMaxSize: Number.MAX_VALUE };
  var client = {
    DEFAULT_OPTIONS: defaults, options: options === undefined ? defaults : options,
    calculateBandwidth: function (size, start) { return size * 8 / ((environment.now() - start) / 1000); },
    truncate: function (data, maxSize) {
      if (maxSize === undefined) return;
      if (data.length > maxSize) {
        if (data.substring) data = data.substring(0, maxSize);
        else data.length = maxSize;
      }
      return data;
    },
    fimExec: function () {},
    XhrPromise: {
      then: function (success, failure) {
        var active = client.XhrPromise.promise;
        var next = active.then(success, failure); next.cancel = next.abort = active.cancel; next.xhr = active.xhr;
        return next;
      },
      executor: function (resolve, reject) { client.XhrPromise.create(client.XhrPromise.options).then(resolve, reject); },
      REJECT_RESPONSE: function () { return { status: -1, statusText: 'Canceled' }; },
      create: function (config) {
        var xhr = new environment.XMLHttpRequest();
        var promise = new Promise(function (resolve, reject) {
          xhr.open(config.method, config.url);
          Object.keys(config.headers || {}).forEach(function (key) { xhr.setRequestHeader(key, config.headers[key]); });
          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
            else reject({ status: xhr.status, statusText: xhr.statusText });
          };
          xhr.onerror = function () { reject({ status: xhr.status, statusText: xhr.statusText }); };
          xhr.onabort = function () { reject(client.XhrPromise.REJECT_RESPONSE()); };
          xhr.send(config.data);
        });
        promise.xhr = xhr;
        promise.cancel = promise.abort = function () { xhr.abort(); };
        client.XhrPromise.options = config;
        client.XhrPromise.promise = promise;
        client.XhrPromise.xhr = xhr;
        return promise;
      },
      abort: function () { if (client.XhrPromise.promise) client.XhrPromise.promise.abort(); },
      cancel: function () { client.XhrPromise.abort(); }
    },
    testDownloadSpeed: function (settings) {
      settings = settings === undefined ? client.options : settings;
      var start = environment.now();
      var task = transfer('GET', settings.downloadUrl, start);
      return map(task, function (response) {
        var data = response.data || response;
        return { downloadSpeed: client.calculateBandwidth(data.length, start), data: data };
      });
    },
    testUploadSpeed: function (settings) {
      settings = settings === undefined ? client.options : settings;
      if (!settings.uploadData) {
        settings.uploadData = Array.from({ length: Math.min(settings.uploadDataSize, settings.uploadDataMaxSize) }, function () { return Math.floor(environment.random() * 256); });
      } else settings.uploadData = client.truncate(settings.uploadData, settings.uploadDataMaxSize);
      var start = environment.now();
      return map(transfer('POST', settings.uploadUrl, start, settings.uploadData), function () {
        return { uploadSpeed: client.calculateBandwidth(settings.uploadData.length, start) };
      });
    },
    testLatency: function (settings) {
      settings = settings === undefined ? client.options : settings;
      settings.latencyTestUrl = settings.latencyTestUrl || settings.downloadUrl;
      var start = environment.now();
      return map(transfer('HEAD', settings.latencyTestUrl, start), function () { return { latency: (environment.now() - start) / 2 }; });
    },
    testSpeed: function (settings) {
      settings = settings === undefined ? client.options : settings;
      var active = client.testLatency(settings);
      var canceled = false;
      function checkCanceled() { if (canceled) throw client.XhrPromise.REJECT_RESPONSE(); }
      var result = active.then(function (latency) {
        checkCanceled(); active = client.testDownloadSpeed(settings);
        return active.then(function (download) {
          checkCanceled(); settings.uploadData = download.data; active = client.testUploadSpeed(settings);
          return active.then(function (upload) {
            checkCanceled(); client.fimExec();
            return { latency: latency.latency, downloadSpeed: download.downloadSpeed, uploadSpeed: upload.uploadSpeed };
          });
        });
      });
      result.cancel = result.abort = function () { canceled = true; active.cancel(); };
      return result;
    }
  };
  function transfer(method, url, started, data) {
    return client.XhrPromise.create({ method: method, url: url + (url.indexOf('?') < 0 ? '?' : '&') + 'id=' + started,
      data: data, headers: { 'Content-type': 'application/octet-stream' } });
  }
  function map(task, callback) { var result = task.then(callback); result.cancel = result.abort = task.cancel; return result; }
  return client;
}
