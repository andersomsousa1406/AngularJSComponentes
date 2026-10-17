export default function registerGcDeviceBridge(app) {
  app.angularModule.constant('GcDeviceConfig', {
    serverUrl: 'http://127.0.0.1:8081/datasnap/rest/TServerMethods1/',
    printUrl: 'https://www.gcwebmfe.com:8080/datasnap/rest/TServerMethods1/',
    timeout: 10000
  });

  app.angularModule.factory('GcDeviceBridge', ['$http', 'GcDeviceConfig', function ($http, config) {
    function command(name, parameters, options) {
      options = options || {};
      var baseUrl = options.print ? config.printUrl : config.serverUrl;
      var suffix = parameters === undefined ? '' : '/' + encodeURIComponent(JSON.stringify(parameters));
      return $http.get(baseUrl + name + suffix, { timeout: options.timeout || config.timeout }).then(function (response) {
        var data = response.data;
        if (data && data.error) throw new Error(data.error);
        if (data && data.result && data.result[0]) {
          try { data = JSON.parse(data.result[0]); } catch (_) { data = data.result[0]; }
        }
        return data;
      });
    }

    return {
      command: command,
      connectScale: function () { return command('conectar_balanca'); },
      disconnectScale: function () { return command('desconectar_balanca'); },
      printLabel: function (data) { return command('imprimir_etiqueta', data, { print: true }); },
      printReceipt: function (data) { return command('imprimir_cupom', data, { print: true }); },
      health: function () { return command('echo'); }
    };
  }]);
  return app;
}
