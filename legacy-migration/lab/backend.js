export default function registerLabBackend(app) {
  app.angularModule.factory('GcLabBackend', ['$q', '$timeout', function ($q, $timeout) {
    var people = [
      { ID: 1, NOME: 'Ana Lima', DESCRICAO: 'Ana Lima', CIDADE: 'Fortaleza', VALOR: 125.5, STATUS: '1' },
      { ID: 2, NOME: 'Bruno Reis', DESCRICAO: 'Bruno Reis', CIDADE: 'Recife', VALOR: 89.9, STATUS: '1' },
      { ID: 3, NOME: 'Carla Souza', DESCRICAO: 'Carla Souza', CIDADE: 'Natal', VALOR: 200, STATUS: '0' },
      { ID: 4, NOME: 'Diego Alves', DESCRICAO: 'Diego Alves', CIDADE: 'Teresina', VALOR: 42, STATUS: '1' },
      { ID: 5, NOME: 'Elisa Melo', DESCRICAO: 'Elisa Melo', CIDADE: 'Fortaleza', VALOR: 500, STATUS: '1' }
    ];
    var records = angular.copy(people);
    var files = [{ ID: 1, ARQUIVO: 'exemplo.txt', EXTENSAO: 'txt', TAMANHO: 80, CAMINHO: 'lab/exemplo.txt', OBSERVACAO: 'Arquivo de exemplo', SEQUENCIA: 1 }];
    var backend = { calls: [], failNext: false, latency: 120, people: people, mode: 'simulado' };
    function safeSnapshot(data) {
      var seen = new Set();
      return JSON.parse(JSON.stringify(data, function (key, value) {
        if (/senha|credencial|password|token/i.test(key)) return '[oculto]';
        if (value instanceof Blob) return { arquivo: value.name || 'blob', bytes: value.size };
        if (value && typeof value === 'object') { if (seen.has(value)) return '[referencia]'; seen.add(value); }
        return value;
      }) || 'null');
    }
    function dispatch(url, data) {
      if (url.indexOf('/datasnap/') >= 0) return { result: [JSON.stringify({ OK: true, MENSAGEM: 'Dispositivo simulado' })] };
      if (url === '/lab/people') {
        var query = typeof data.FILTRO === 'string' ? data.FILTRO.replace(/''/g, "'").toLowerCase() : '';
        var filtered = people.filter(function (row) { return (row.NOME + ' ' + row.ID).toLowerCase().indexOf(query) >= 0; });
        var page = data.CONSULTA || { PAGINA: 0, QTD: filtered.length };
        return filtered.slice(page.PAGINA, page.PAGINA + page.QTD);
      }
      if (url === '/lab/cadastro/listar') return angular.copy(records);
      if (url === '/lab/cadastro/gravar') {
        var selected = angular.copy(data.DADOS);
        if (!selected.ID) selected.ID = Math.max.apply(null, [0].concat(records.map(function (row) { return row.ID; }))) + 1;
        var index = records.findIndex(function (row) { return row.ID === selected.ID; });
        if (index >= 0) records[index] = selected; else records.push(selected);
        return { ID_RETURN: selected.ID, DATA_RETURN: angular.copy(records) };
      }
      if (url === '/lab/cadastro/excluir') { records = records.filter(function (row) { return row.ID !== data.DADOS.ID; }); return { STATUS: 'OK' }; }
      if (url === '/api/historico') return [
        { ID: 1, DATA: '19/10/2026 09:00', DATAHORA_TEXT: '19/10/2026 09:00', USUARIO: 'operador', DESCRICAO: 'Registro criado', HISTORICO: 'Registro criado' },
        { ID: 2, DATA: '19/10/2026 09:10', DATAHORA_TEXT: '19/10/2026 09:10', USUARIO: 'supervisor', DESCRICAO: 'Registro revisado', HISTORICO: 'Registro revisado' }
      ];
      if (url === '/api/getFiles') return angular.copy(files);
      if (url === '/api/gravarGFiles') {
        files = data.ARQUIVOS.map(function (item, index) { return { ID: item.ID || index + 10, ARQUIVO: item.NOME, EXTENSAO: item.TYPE.toLowerCase(), TAMANHO: item.TAMANHO, OBSERVACAO: item.OBSERVACAO, SEQUENCIA: item.SEQUENCIA, CAMINHO: 'lab/exemplo.txt' }; });
        return angular.copy(files);
      }
      if (url === '/api/gerarTokenArquivos') return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><rect width="180" height="180" fill="#eee"/><text x="24" y="90">Token simulado</text></svg>');
      if (url === '/api/limparTokenArquivos') return { STATUS: 'OK' };
      if (url === '/api/executarFluxoOperacional') return { REGISTRO_REQUISICOES: [{ ID: 1, DESCRICAO: 'Autorizar processamento', STATUS: 0 }], POSSUI_VALIDACAO_PENDENTE: 1, ULTIMA_VALIDACAO_AUTORIZADA: 0 };
      if (url === '/api/validarOpcaoTarefa') return [];
      if (url === '/api/executarOpcaoTarefa') return { USUARIO_SEM_PERMISSAO: 0, RESULTADO_VALIDACAO: [] };
      if (url === '/api/consultarProgressoFluxoOperacional') return { PROGRESSO: 75 };
      if (url === '/rfid/consultarProdutoEPC') return [{ EPC: data.EPC, MODELO_ID: 1, COR_ID: 1, TAMANHO: 40, DESCRICAO: 'Produto de teste', QUANTIDADE: 1, CONSULTADO: true }];
      if (url === '/rfid/consultarListaProdutoEPC') return data.ITENS.map(function (item) { return Object.assign({}, item, { CONSULTADO: true }); });
      if (url === '/api/controleTabela/gravarColunasVisiveis') return { DATA_RETURN: data.ITENS_MARCADOS };
      throw new Error('Resposta simulada nao cadastrada para ' + url);
    }
    backend.post = function (url, data) {
      var record = { id: backend.calls.length + 1, method: 'POST', url: url, data: safeSnapshot(data), status: 'aguardando' };
      backend.calls.unshift(record);
      if (backend.calls.length > 100) backend.calls.length = 100;
      var fail = backend.failNext; backend.failNext = false;
      return $timeout(function () {
        if (fail) { record.status = 'erro'; throw new Error('Falha simulada para testar o tratamento de erros.'); }
        try { var result = dispatch(url, data || {}); record.status = 'sucesso'; return result; }
        catch (error) { record.status = 'erro'; throw error; }
      }, backend.latency);
    };
    backend.postFile = function (url, data) { var result = backend.post(url, data); backend.calls[0].method = 'POST multipart'; return result; };
    backend.request = function (config) { var result = backend.post(config.url, config.data); backend.calls[0].method = config.method; return result; };
    return backend;
  }]);
  // This override belongs only to the lab app: component requests never reach GCWeb.
  app.angularModule.factory('GcApi', ['GcLabBackend', function (backend) { return backend; }]);
  return app;
}
