export default function registerGcApi(app) {
  app.angularModule.factory('GcApi', ['$http', '$q', function ($http, $q) {
    function request(method, url, data, config) {
      return $http(Object.assign({}, config || {}, { method: method, url: url, data: data }))
        .then(function (response) { return response.data; })
        .catch(function (error) {
          return $q.reject({
            status: error.status,
            message: (error.data && (error.data.message || error.data.error)) || error.statusText || 'Falha na requisicao.',
            cause: error
          });
        });
    }

    return {
      request: request,
      get: function (url, config) { return request('GET', url, undefined, config); },
      post: function (url, data, config) { return request('POST', url, data, config); },
      put: function (url, data, config) { return request('PUT', url, data, config); },
      remove: function (url, config) { return request('DELETE', url, undefined, config); }
    };
  }]);
  return app;
}
