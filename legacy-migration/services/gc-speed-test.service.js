import { createSpeedClient } from './speed-client.js';

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
      var started = $window.performance.now();
      return $q.when(timedFetch(url + (url.indexOf('?') < 0 ? '?' : '&') + '_=' + Date.now(), { cache: 'no-store' })).then(function (result) {
        return result.response.arrayBuffer().then(function (buffer) {
          var duration = $window.performance.now() - started;
          return { bytes: buffer.byteLength, milliseconds: duration, mbps: (buffer.byteLength * 8) / (duration / 1000) / 1000000 };
        });
      });
    }
    function create(options) {
      return createSpeedClient({ XMLHttpRequest: $window.XMLHttpRequest, now: Date.now, random: Math.random }, options);
    }
    return Object.assign(create(), { create: create, latency: latency, download: download });
  }]);
  return app;
}
