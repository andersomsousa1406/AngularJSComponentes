export function cleanFlowData(value, seen) {
  if (typeof value === 'function' || value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  seen = seen || new Set();
  if (seen.has(value)) throw new Error('Dados de validacao possuem referencia circular.');
  seen.add(value);
  var result;
  if (value instanceof Date) result = value.toISOString();
  else if (Array.isArray(value)) result = value.map(function (item) { return cleanFlowData(item, seen); });
  else result = Object.fromEntries(Object.keys(value).filter(function (key) { return !key.startsWith('$$') && typeof value[key] !== 'function' && value[key] !== undefined; })
    .map(function (key) { return [key, cleanFlowData(value[key], seen)]; }));
  seen.delete(value); return result;
}
export function createFlowClient(api, configuration, environment) {
  environment = environment || {};
  var notify = environment.notify || function () {};
  var disposed = false;
  var client = {
    ARGS: {}, DADOS: [], HISTORICO: [], FILTRO: '', FILTRO_DADOS: '', TAREFA_SELECTED: {}, SELECTED: {},
    PANEL_SOLICITACOES_ABERTO: false, executando_operacao: false, consultando_operacao_progresso: false,
    loginOpen: false, motiveOpen: false, errors: [], SENHA_INFORMADA: '', MOTIVO_RETORNO: '', MOTIVO_RECUSA: '',
    execPosValidar: function () {}, limparParaEnvio: cleanFlowData,
    executar: function () {
      if (environment.userId !== undefined) client.ARGS.USUARIO_ID = environment.userId;
      return call('/api/executarFluxoOperacional', client.ARGS).then(function (response) {
        client.DADOS = response.REGISTRO_REQUISICOES || [];
        client.SELECTED = client.DADOS.filter(function (row) { return row.STATUS == 0; }).pop() || {};
        var pending = client.DADOS.some(function (row) { return row.STATUS == 0; });
        if (response.POSSUI_VALIDACAO_PENDENTE == 0 && !pending) client.execPosValidar();
        notify(); return response;
      });
    },
    consultarProgresso: function () {
      return call('/api/consultarProgressoFluxoOperacional', client.ARGS).then(function (response) {
        client.progresso = response; notify(); return response;
      });
    },
    consultarHistorico: function () {
      return call('/api/historico', client.FILTRO_HISTORICO || client.ARGS).then(function (response) { client.HISTORICO = response; notify(); return response; });
    },
    opcaoAprovar: function () { return option(1); },
    opcaoRecusar: function () { return option(2); },
    opcaoVoltar: function () { return option(3); },
    opcaoVerMotivo: function (type) { client.TIPO_MOTIVO = type; client.motiveOpen = true; notify(); },
    validarOpcao: function () {
      return call('/api/validarOpcaoTarefa', client.ARGS).then(function (response) {
        client.errors = response;
        if (!response.length) { client.SENHA_INFORMADA = ''; client.MOTIVO_RETORNO = ''; client.MOTIVO_RECUSA = ''; client.loginOpen = true; }
        notify(); return response;
      });
    },
    validarUsuario: function () {
      if (!String(client.SENHA_INFORMADA).trim()) return Promise.reject(new Error('Informe uma credencial válida!'));
      if (client.ARGS.OPCAO_TAREFA === 2 && String(client.MOTIVO_RECUSA).trim().length < 10) return Promise.reject(new Error('Informe um motivo de recusa com pelo menos 10 caracteres.'));
      if (client.ARGS.OPCAO_TAREFA === 3 && String(client.MOTIVO_RETORNO).trim().length < 10) return Promise.reject(new Error('Informe um motivo de retorno com pelo menos 10 caracteres.'));
      Object.assign(client.ARGS, { SENHA_INFORMADA: client.SENHA_INFORMADA, MOTIVO_RETORNO: client.MOTIVO_RETORNO, MOTIVO_RECUSA: client.MOTIVO_RECUSA });
      return call('/api/executarOpcaoTarefa', client.ARGS).then(function (response) {
        client.errors = response.RESULTADO_VALIDACAO || [];
        if (response.USUARIO_SEM_PERMISSAO == 1) throw new Error('Credenciais informadas não possuem permissão para esta operação.');
        if (!client.errors.some(function (item) { return item.erro == 1; })) client.loginOpen = false;
        notify(); return response;
      });
    },
    processarValidacaoJavascript: function (scripts) {
      if (!environment.validateScripts) return Promise.reject(new Error('Configure o executor isolado dos scripts de validacao.'));
      return environment.validateScripts(scripts, cleanFlowData(environment.validationData || client.SELECTED));
    },
    changePainel: function (name) { if (name === 'dadosSolicitacoes1') { client.PANEL_SOLICITACOES_ABERTO = !client.PANEL_SOLICITACOES_ABERTO; notify(); } },
    destroy: function () { disposed = true; }
  };
  function option(value) { client.ARGS.DADOS_TAREFA = client.TAREFA_SELECTED; client.ARGS.OPCAO_TAREFA = value; return client.validarOpcao(); }
  function call(url, data) {
    if (disposed) return Promise.reject(new Error('Fluxo destruido.'));
    client.executando_operacao = true; notify();
    return Promise.resolve().then(function () { return api.post(url, cleanFlowData(data)); })
      .finally(function () { client.executando_operacao = false; if (!disposed) notify(); });
  }
  Object.assign(client, configuration || {}); return client;
}
