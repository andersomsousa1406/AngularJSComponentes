export function createSpeechClient(environment, options) {
  options = options || {};
  var commands = options.commands || [];
  var disposed = false;
  function fail(error) { if (options.onError) options.onError(error); else throw error; }
  function update(callback) { environment.update(function () { if (!disposed) callback(); }); }
  var client = {
    valido: false, executando: false, SpeechRecognitionObj: null, interim_transcript: '',
    onstart: function () { update(function () { client.executando = true; }); },
    onend: function () { update(function () { client.executando = false; }); },
    onerror: function (event) {
      update(function () { client.executando = false; fail(new Error(event.error || 'Não foi possível ouvir o comando')); });
    },
    onresult: function (event) {
      update(function () {
        client.interim_transcript = '';
        for (var index = event.resultIndex; index < event.results.length; index++) {
          if (event.results[index].isFinal) {
            client.executando = false; client.tratarMensagem(event.results[index][0].transcript);
          } else client.interim_transcript += event.results[index][0].transcript;
        }
      });
    },
    iniciar: function () {
      if (disposed) throw new Error('Reconhecimento destruido.');
      try {
        if (!client.valido) {
          var Recognition = environment.Recognition;
          if (!Recognition) throw new Error('Seu navegador não tem suporte');
          var recognition = client.SpeechRecognitionObj = new Recognition();
          recognition.pai = client;
          ['onstart', 'onresult', 'onerror', 'onend'].forEach(function (event) { recognition[event] = client[event]; });
          if (options.lang) recognition.lang = options.lang;
          client.valido = true;
        }
        return client.SpeechRecognitionObj.start();
      } catch (error) { fail(error); }
    },
    comandoManual: function (message) { return client.tratarMensagem(message); },
    tratarMensagem: function (message) {
      var text = String(message).toUpperCase();
      if (!text) { fail(new Error('Não foi possível ouvir o comando')); return false; }
      var found = false;
      commands.forEach(function (command) {
        var remaining = text;
        var parts = String(command.COMANDO).split('#VAR#').filter(Boolean);
        if (!parts.length) return;
        if (!parts.every(function (part) { return text.indexOf(part) >= 0; })) return;
        parts.forEach(function (part) { remaining = remaining.replace(part, '|'); });
        var variables = remaining.split('|').filter(Boolean);
        if (command.variaveis === variables.length) { found = true; command.FUNCAO(variables); }
      });
      if (!found) fail(new Error('O comando "' + text + '" não foi encontrado.'));
      return found;
    },
    stop: function () { if (client.SpeechRecognitionObj) client.SpeechRecognitionObj.stop(); },
    destroy: function () {
      disposed = true;
      if (client.SpeechRecognitionObj) {
        ['onstart', 'onresult', 'onerror', 'onend'].forEach(function (event) { client.SpeechRecognitionObj[event] = null; });
        client.SpeechRecognitionObj.abort();
      }
      client.executando = false;
    }
  };
  return client;
}

export function createDefaultSpeechCommands(open, api, baseUrl, onError) {
  function numeric(text) { return text.trim() !== '' && Number.isFinite(Number(text)); }
  function order(values, invoice) {
    var id = String(values[0]).replace(' ', '');
    if (numeric(id)) return open(baseUrl + '/_12201?PEDIDO=' + id + (invoice ? '&GERAR_NOTA=1' : ''), '_blank');
    onError(new Error('Pedido "' + id + '" não encontrado'));
  }
  return [
    { COMANDO: 'ABRIR MENU #VAR#', variaveis: 1, FUNCAO: function (values) {
      var menu = String(values[0]).replace(' ', '');
      if (Number(menu) >= 10000 && Number(menu) <= 99000) open(baseUrl + '/_' + menu, '_blank');
    } },
    { COMANDO: 'ABRIR LOGO', variaveis: 0, FUNCAO: function () { open(baseUrl + '/js/gcweb.html', '_blank'); } },
    { COMANDO: 'ABRIR PEDIDOS #VAR#', variaveis: 1, FUNCAO: function (values) {
      var customer = String(values[0]);
      return api.post('_12201/api/consultaCliente', { ID: numeric(customer) ? customer : '', NOME: customer }, { contentType: 'application/json' })
        .then(function (response) {
          if (response.length) open(baseUrl + '/_12201?CLIENTE=' + response[0].CODIGO + '&DESCLIENTE=' + response[0].RAZAOSOCIAL, '_blank');
          else onError(new Error('Cliente "' + customer + '" não encontrado'));
        }).catch(onError);
    } },
    { COMANDO: 'ABRIR PEDIDO #VAR#', variaveis: 1, FUNCAO: function (values) { return order(values, false); } },
    { COMANDO: 'FATURAR PEDIDO #VAR#', variaveis: 1, FUNCAO: function (values) { return order(values, true); } }
  ];
}
