export function createDeviceClient(request, options) {
  options = options || {};
  var client = {
    server: options.server || 'http://127.0.0.1:8081',
    serverPrint: options.serverPrint || 'https://www.gcwebmfe.com:8080',
    iniciandoServer: false,
    IMPRESSORAS: [], IMPRESSORA_SELECTED: {}, progress: 0,
    iniciarServidor: function () {
      if (client.iniciandoServer) return client.launchPromise;
      if (typeof options.launch !== 'function') return Promise.reject(new Error('Configure a confirmacao de inicio do servidor de dispositivos.'));
      client.iniciandoServer = true;
      client.launchPromise = Promise.resolve().then(function () { return options.launch(client); })
        .finally(function () { client.iniciandoServer = false; });
      return client.launchPromise;
    },
    testarServer: function () {
      return request({ method: 'GET', url: client.server }).then(function () {
        return { valido: true, retorno: '' };
      }, function () { return { valido: false, retorno: '' }; });
    },
    execComando: function (url, parameters) { return execute(url, parameters, true); },
    execComando2: function (url, parameters) { return execute(url, parameters, false); },
    execComandoProgress: function (url, parameters) {
      progress(100);
      return execute(url, parameters, true).finally(function () { progress(0); });
    },
    getImpressoras: function () { return client.execComando(client.printer_url + 'getImpressoras', { CODIGO: '' }); },
    postImpressoras1: function (text) { return client.execComando(client.printer_url + 'postImpressoras1', { ETIQUETA: text }); },
    postImpressoras2: function (text) {
      return client.getImpressoras().then(function (result) {
        if (!result.valido) return result;
        client.IMPRESSORAS = result.retorno;
        client.IMPRESSORA_SELECTED = client.IMPRESSORAS.find(function (item) { return item.PADRAO == 1; }) || {};
        if (typeof options.selectPrinter !== 'function') throw new Error('Configure a selecao declarativa de impressora.');
        return Promise.resolve(options.selectPrinter(client)).then(function (selected) {
          if (!selected) return { valido: false, retorno: 'Cancelado' };
          client.IMPRESSORA_SELECTED = selected;
          return client.execComando(client.printer_url + 'postImpressoras2', { ETIQUETA: text, IMPRESSORA: selected.PRINTER });
        });
      });
    },
    printAuto: function (text) {
      if (/Linux/.test(options.userAgent || '')) return client.postImpressoras1(text);
      if (typeof options.postprint !== 'function') return Promise.reject(new Error('Configure o transporte de impressao postprint.'));
      return options.postprint(text);
    },
    htmlToPDF: function (html) { return client.execComandoProgress(client.server_url + 'htmlToPDF', { HTML: html }); }
  };
  client.server_url = options.serverUrl || client.server + '/datasnap/rest/TServerMethods1/';
  client.printer_url = options.printUrl || client.serverPrint + '/datasnap/rest/TServerMethods1/';
  function progress(value) { client.progress = value; if (options.onProgress) options.onProgress(value); }
  function execute(url, parameters, launch) {
    var suffix = parameters === undefined ? '' : '/' + encodeURIComponent(JSON.stringify(parameters));
    return request({ method: 'GET', url: url + suffix, timeout: options.timeout }).then(function (response) {
      var data = typeof response === 'string' ? JSON.parse(response) : response;
      if (data && !data.error && Array.isArray(data.result)) {
        data = typeof data.result[0] === 'string' ? JSON.parse(data.result[0]) : data.result[0];
      }
      return { valido: !(data && data.error), retorno: data };
    }, function (error) {
      if (error.status === 0 || error.status === -1) {
        if (launch && options.launch) client.iniciarServidor().catch(function (failure) { if (options.onError) options.onError(failure); });
        return { valido: false, retorno: 'Erro ao conectar com o servidor de dispositivos do GCWeb.' };
      }
      return { valido: false, retorno: { error: 'erro ao conectar' } };
    });
  }
  [
    ['imprimirEtiqueta', 'imprimirEtiqueta', 'CODIGO'], ['imprimirCupom', 'imprimirCupom', 'CODIGO'],
    ['imprimirCheque', 'imprimirCheque'], ['imprimirEspelhoPonto', 'imprimirEspelhoPonto', 'COLABORADORES'],
    ['imprimirRelatorio', 'imprimirRelatorio', 'DADOS'],
    ['ligarBalanca', 'ligarBalanca', null, false, true], ['desligarBalanca', 'desligarBalanca', null, false, true],
    ['pesoBalanca', 'pesoBalanca', null, true, true], ['conectarHenry', 'loginHenry', null, true],
    ['conectarInner', 'loginInner', null, true], ['lerPedidoBihands', 'lerPedidoBihands', null, true]
  ].forEach(function (definition) {
    client[definition[0]] = function (value) {
      var data = definition[2] ? Object.fromEntries([[definition[2], value]]) : (definition[4] ? {} : value);
      return client[definition[3] ? 'execComando2' : 'execComando'](client.server_url + definition[1], data);
    };
  });
  return client;
}
