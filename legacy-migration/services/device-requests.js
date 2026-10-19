export function createDeviceRequests(request, api, options) {
  options = options || {};
  var client = {
    developing: 0, backdropOpen: false,
    requestExc: function (method, endpoint, data) {
      return request({ method: method, url: (options.url || 'http://localhost:8433/') + endpoint,
        headers: { 'Content-Type': 'application/json' }, data: JSON.stringify(data), timeout: 0 })
        .then(function (response) {
          if (response.status === 'success') return response.data;
          return Promise.reject(response.data);
        });
    }
  };
  client.balanca = {
    pai: client,
    conectar: function () { return client.requestExc('GET', 'conectar', [], 'conectar_balanca'); },
    desconectar: function () { return client.requestExc('GET', 'desconectar', [], 'desconectar_balanca'); },
    lerPeso: function () { return client.requestExc('GET', 'peso', [], 'peso_balanca').then(function (data) { return client.balanca.tratarPeso(data.peso); }); },
    tratarPeso: function (value) { return value; }
  };
  var digital = client.digital = {
    pai: client,
    backdrop: function (open) { client.backdropOpen = open; if (options.onBackdrop) options.onBackdrop(open); },
    cadastrar: function (table, id) {
      digital.backdrop(true);
      return client.requestExc('POST', 'capiturarDigital', { user_name: table, user_id: id }, 'capiturar_digital')
        .then(function (raw) {
          var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (data.DIGITAL && data.DIGITAL !== 'vazio' && data.DIGITAL.length > 100) {
            return digital.gravarDigital(table, id, data.DIGITAL, data.TIPO).then(function () { return raw; });
          }
          if (options.onError) options.onError(new Error('Digital não capturada, tente novamente!'));
          return [];
        }).finally(function () { digital.backdrop(false); });
    },
    identificar: function (table, id) {
      digital.backdrop(true);
      return digital.digitaisVersao().then(function (version) {
        return client.requestExc('POST', 'identificarDigital', { version_db: version, tabela: table }, 'identificar_digital');
      }).then(function (data) {
        if (String(data).indexOf('Erro') !== -1) {
          if (options.onError) options.onError(new Error('Digital não capturada, tente novamente!'));
          return false;
        }
        return String(data).split(',').some(function (value) {
          var parts = value.split('.'); return parts[0] == table && parts[1] == id;
        });
      }).finally(function () { digital.backdrop(false); });
    },
    removerDigital: function (value) { return api.post('/digitais/remover', { digital: value }); },
    gravarDigital: function (table, id, values, type) { return api.post('/digitais/gravar', { TABELA: table, TABELA_ID: id, DIGITAIS: values, TIPO_LEITOR: type }); },
    digitaisVersao: function (type) { return api.post('/digitais/versao', { TIPO_LEITOR: type }).then(function (data) { return data.VERSAO; }); },
    getDigitais: function (table, id) { return api.post('/digitais/getLista', { TABELA: table, TABELA_ID: id }); }
  };
  return client;
}
