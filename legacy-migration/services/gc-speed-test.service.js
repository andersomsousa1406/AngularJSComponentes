export default function registerGcSpeedTest(app) {
  app.angularModule.factory('GcSpeedTest', ['$window', '$q', function ($window, $q) {
    function timedFetch(url, options) {
      var started = $window.performance.now();
      return $window.fetch(url, options).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response;
      }).then(function (response) { return { response: response, duration: $window.performance.now() - started }; });
    }
    function latency(url) { return $q.when(timedFetch(url, { method: 'HEAD', cache: 'no-store' })).then(function (result) { return result.duration; }); }
    function download(url) {
      return $q.when(timedFetch(url + (url.indexOf('?') < 0 ? '?' : '&') + '_=' + Date.now(), { cache: 'no-store' })).then(function (result) {
        return result.response.arrayBuffer().then(function (buffer) {
          return { bytes: buffer.byteLength, milliseconds: result.duration, mbps: (buffer.byteLength * 8) / (result.duration / 1000) / 1000000 };
        });
      });
    }
    return { latency: latency, download: download };
  }]);
  return app;
}
