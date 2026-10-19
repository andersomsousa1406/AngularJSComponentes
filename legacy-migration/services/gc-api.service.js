export default function registerGcApi(app) {
  app.angularModule.factory('GcApi', ['$http', '$q', '$injector', '$document', function ($http, $q, $injector, $document) {
    var pending = new Set();
    function request(method, url, data, config) {
      config = config || {};
      if ($injector.has('$ajax')) {
        var ajax = $injector.get('$ajax');
        var operation = method === 'POSTFILE' ? 'postFile' : method.toLowerCase();
        if (typeof ajax[operation] === 'function') return method === 'GET' || method === 'DELETE' ? ajax[operation](url, config) : ajax[operation](url, data, config);
      }
      var headers = Object.assign({}, config.headers);
      var token = $document[0].querySelector('meta[name="csrf_token"],meta[name="csrf-token"]');
      var location = $document[0].location;
      if (token && location && new URL(url, location.href).origin === location.origin) headers['X-CSRF-TOKEN'] = token.content;
      if (method === 'POSTFILE') {
        var form = new FormData();
        function append(value, key) {
          if (value === undefined) return;
          if (value === null) form.append(key, '');
          else if (value instanceof Blob || value instanceof Date) form.append(key, value instanceof Date ? value.toISOString() : value);
          else if (typeof value === 'object') Object.keys(value).forEach(function (field) { append(value[field], key ? key + '[' + field + ']' : field); });
          else form.append(key, String(value));
        }
        append(data, ''); data = form; headers['Content-Type'] = undefined; method = 'POST';
      }
      var cancellation = $q.defer();
      var timer;
      pending.add(cancellation);
      if (typeof config.timeout === 'number' && config.timeout > 0) timer = setTimeout(function () { cancellation.resolve(); }, config.timeout);
      else if (config.timeout && typeof config.timeout.then === 'function') config.timeout.then(function () { cancellation.resolve(); });
      return $http(Object.assign({}, config, { method: method, url: url, data: data, headers: headers, timeout: cancellation.promise }))
        .then(function (response) { return response.data; })
        .catch(function (error) {
          return $q.reject({
            status: error.status,
            message: (error.data && (error.data.message || error.data.error)) || error.statusText || 'Falha na requisicao.',
            cause: error
          });
        }).finally(function () { pending.delete(cancellation); if (timer) clearTimeout(timer); if (typeof config.complete === 'function') config.complete(); });
    }

    return {
      request: request,
      get: function (url, config) { return request('GET', url, undefined, config); },
      post: function (url, data, config) { return request('POST', url, data, config); },
      postFile: function (url, data, config) { return request('POSTFILE', url, data, config); },
      put: function (url, data, config) { return request('PUT', url, data, config); },
      remove: function (url, config) { return request('DELETE', url, undefined, config); },
      delete: function (url, config) { return request('DELETE', url, undefined, config); },
      abort: function () { pending.forEach(function (cancellation) { cancellation.resolve(); }); pending.clear(); if ($injector.has('$ajax')) return $injector.get('$ajax').abort(); }
    };
  }]);
  return app;
}
