export function createEpcClient(api, options) {
  options = options || {};
  function notify() { if (options.notify) options.notify(); }
  function error(message) { client.error = message; notify(); if (options.onError) options.onError(new Error(message)); return false; }
  function matches(left, right) { return left.MODELO_ID == right.MODELO_ID && left.COR_ID == right.COR_ID && left.TAMANHO == right.TAMANHO; }
  var client = {
    QUANTIDADE_SIMPLIFICADA: 1, EPC_SIMPLIFICADO: '', BIPAGEM_INVERSA: false, EXIBIR_DESCRICAO: false,
    VISUALIZAR_EST_DISPONIVEL: false, VISUALIZAR_VALOR_UNITARIO: false, EXIBIR_BIPAGEM_INVERSA: true,
    VISUALIZAR_LOTE: false, CONFERENCIA: false, CONF_COMPLETA: true, PRECO_PDV: false,
    ITENS_INCLUIR: [], ITENS_LISTA: [], ITENS_ERRO_LISTA: [], LOTE: '0', QUANTIDADE_TOTAL: 0,
    QUANTIDADE_TOTAL_ITENS: 0, QUANTIDADE_TOTAL_CONFERIDA: 0, QUANTIDADE_TOTAL_CONFERIR: 0,
    LOCALIZACAO_ID: 0, ESTABELECIMENTO_ID: 0, TABELA_PRECO_ID: 0, PERFIL_PEDIDO: '', SEND: {},
    open: false, errorOpen: false,
    focus: function () { if (options.focus) options.focus(); },
    getConfiguracao: function () {},
    iniciar: function (parameters) {
      parameters = parameters || {};
      client.ITENS_INCLUIR = []; client.ITENS_LISTA = angular.copy(parameters.itens || []);
      client.CONFERENCIA = !!parameters.conferencia; client.CONF_COMPLETA = parameters.conf_completa !== false;
      client.VISUALIZAR_LOTE = !!parameters.ver_lote; client.VISUALIZAR_EST_DISPONIVEL = !!parameters.ver_estoque;
      client.EXIBIR_BIPAGEM_INVERSA = !!parameters.ver_remover; client.VISUALIZAR_VALOR_UNITARIO = !!parameters.ver_valor;
      client.PRECO_PDV = !!parameters.preco_pdv; client.INFO_PEDIDO = !!parameters.info_pedido; client.INFO_PDV = !!parameters.info_pdv;
      client.LOTE = ''; client.EPC_SIMPLIFICADO = ''; client.BIPAGEM_INVERSA = false; client.EXIBIR_DESCRICAO = client.CONFERENCIA;
      client.QUANTIDADE_TOTAL = client.QUANTIDADE_TOTAL_ITENS = client.QUANTIDADE_TOTAL_CONFERIDA = client.QUANTIDADE_TOTAL_CONFERIR = 0;
      if (client.CONFERENCIA) client.ITENS_LISTA.forEach(function (item) {
        item.STATUS = 0; item.CONFERIDO = 0; item.EPCS = []; client.QUANTIDADE_TOTAL_CONFERIR += Number(item.QUANTIDADE);
      });
      client.open = !client.CONFERENCIA || client.QUANTIDADE_TOTAL_CONFERIR > 0;
      if (!client.open) error('Nenhum item encontrado na lista de conferência.');
      client.focus(); notify();
    },
    onAddItens: function () { return Promise.resolve(); }, onRemoverItens: function () { return Promise.resolve(); },
    validarItemGravar: function () { return { STATUS: true, MSG: '' }; },
    validarItemIncluir: function () { return { STATUS: true, MSG: '' }; },
    validarItemExcluir: function () { return { STATUS: true, MSG: '' }; },
    validarItemConferencia: function (item) {
      var found = client.ITENS_LISTA.filter(function (row) { return matches(row, item); });
      if (!found.length) return { STATUS: false, MSG: 'Item não encontrado na lista de conferência.' };
      if (!found.some(function (row) { return row.CONFERIDO < row.QUANTIDADE; })) return { STATUS: false, MSG: 'Item já conferido.' };
      return { STATUS: true, MSG: '' };
    },
    jaNaLista: function (epc) { return client.ITENS_INCLUIR.some(function (item) { return item.EPC === epc; }); },
    AvaliarEPC: function (event) {
      if (event.keyCode !== 13 && event.key !== 'Enter') return;
      if (String(client.EPC_SIMPLIFICADO).trim().length <= 20) return error('EPC ' + client.EPC_SIMPLIFICADO + ' inválido.');
      if (client.jaNaLista(client.EPC_SIMPLIFICADO)) return error('EPC ' + client.EPC_SIMPLIFICADO + ' já adicionado na lista.');
      return client.EXIBIR_DESCRICAO ? client.consultarProdutoEpc() : client.addListaItens();
    },
    addListaItens: function (response) {
      var item = { EPC: client.EPC_SIMPLIFICADO, EAN: '', DESCRICAO: '', SALDO: 0, TAMANHO: 0, DESC_TAMANHO: '',
        VALOR_UNITARIO: 0, QUANTIDADE: client.QUANTIDADE_SIMPLIFICADA, CONSULTADO: false, MODELO_ID: 0, COR_ID: 0 };
      if (response) {
        ['EPC', 'EAN', 'DESCRICAO', 'SALDO', 'TAMANHO', 'DESC_TAMANHO', 'VALOR_UNITARIO', 'MODELO_ID', 'COR_ID'].forEach(function (key) { item[key] = response[key]; });
        item.CONSULTADO = true;
      }
      var validation = client.validarItemIncluir(item);
      if (validation.STATUS && client.CONFERENCIA) validation = client.validarItemConferencia(item);
      if (!validation.STATUS) return error(validation.MSG);
      client.QUANTIDADE_TOTAL += Number(item.QUANTIDADE); client.QUANTIDADE_TOTAL_ITENS += Number(item.QUANTIDADE);
      client.EPC_SIMPLIFICADO = ''; client.QUANTIDADE_SIMPLIFICADA = 1; client.ITENS_INCLUIR.push(item);
      if (client.CONFERENCIA) client.ITENS_LISTA.forEach(function (row) {
        if (matches(row, item)) {
          row.EPCS.push({ EPC: item.EPC, QUANTIDADE: item.QUANTIDADE }); row.CONFERIDO += Number(item.QUANTIDADE);
          client.QUANTIDADE_TOTAL_CONFERIDA += Number(item.QUANTIDADE); if (row.CONFERIDO == row.QUANTIDADE) row.STATUS = 1;
        }
      });
      notify(); return item;
    },
    excluir: function (index, event, item) {
      var validation = client.validarItemExcluir(item);
      if (!validation.STATUS) return error(validation.MSG);
      var position = client.ITENS_INCLUIR.indexOf(item);
      if (position >= 0) {
        client.QUANTIDADE_TOTAL -= Number(item.QUANTIDADE); client.QUANTIDADE_TOTAL_ITENS -= Number(item.QUANTIDADE);
        client.ITENS_INCLUIR.splice(position, 1);
      }
      client.focus(); notify();
    },
    getRequest: function (withItems) {
      client.SEND = {}; client.getConfiguracao();
      var data = angular.copy(client.SEND);
      if (withItems) data.ITENS = client.ITENS_INCLUIR;
      return Object.assign(data, { EPC: client.EPC_SIMPLIFICADO, LOC: client.LOCALIZACAO_ID, ESTAB: client.ESTABELECIMENTO_ID,
        TABELA_PRECO_ID: client.TABELA_PRECO_ID, PERFIL: client.PERFIL_PEDIDO, VIS: client.VISUALIZAR_EST_DISPONIVEL,
        PRECO_PDV: client.PRECO_PDV ? '1' : '0', INFO_PEDIDO: client.INFO_PEDIDO ? '1' : '0', INFO_PDV: client.INFO_PDV ? '1' : '0' });
    },
    consultarProdutoEpc: function () {
      var data = client.getRequest(false); client.EPC_SIMPLIFICADO = '';
      return api.post('/rfid/consultarProdutoEPC', data, { new_job: true }).then(function (rows) {
        if (!rows.length) return error('EPC ' + data.EPC + ' não encontrado na base de dados');
        client.addListaItens(rows[0]); return rows[0];
      });
    },
    consultarListaProdutoEpc: function () {
      var data = client.getRequest(true); client.EPC_SIMPLIFICADO = '';
      return api.post('/rfid/consultarListaProdutoEPC', data, { new_job: true }).then(function (rows) {
        var result = { ITENS: [], ITENS_ERRO: [] };
        rows.forEach(function (row) {
          var validation = client.validarItemGravar(row);
          row.STATUS_ERRO = !(row.CONSULTADO && validation.STATUS);
          row.MSG = row.STATUS_ERRO ? (row.CONSULTADO ? validation.MSG : 'EPC não encontrado na base de dados') : '';
          result[row.STATUS_ERRO ? 'ITENS_ERRO' : 'ITENS'].push(row);
        });
        return result;
      });
    },
    gravar: function () {
      if (!client.ITENS_INCLUIR.length) return Promise.reject(new Error('Nenhum item foi adicionado.'));
      client.ITENS_INCLUIR.forEach(function (item) { item.LOTE = String(client.LOTE).trim() || '0'; item.NAO_ENCONTRADO = 0; });
      if (client.CONFERENCIA) {
        if (client.CONF_COMPLETA && client.QUANTIDADE_TOTAL_CONFERIR !== client.QUANTIDADE_TOTAL_CONFERIDA) return Promise.reject(new Error('A conferência ainda não foi concluída.'));
        return Promise.resolve(client.onAddItens(client.ITENS_INCLUIR, [])).then(client.fechar);
      }
      return client.consultarListaProdutoEpc().then(function (result) {
        if (result.ITENS_ERRO.length) client.AbrirModalErro(result.ITENS_ERRO);
        return Promise.resolve(client[client.BIPAGEM_INVERSA ? 'onRemoverItens' : 'onAddItens'](result.ITENS, result.ITENS_ERRO)).then(client.fechar);
      });
    },
    AbrirModalErro: function (items) { client.ITENS_ERRO_LISTA = items; client.QUANTIDADE_TOTAL_ERROS = items.reduce(function (total, item) { return total + Number(item.QUANTIDADE); }, 0); client.errorOpen = true; notify(); },
    fechar: function () { client.open = false; notify(); }, fecharErro: function () { client.errorOpen = false; notify(); },
    verListaEPC: function (event, item) { client.DADOS_EPC = item; notify(); }
  };
  return client;
}
