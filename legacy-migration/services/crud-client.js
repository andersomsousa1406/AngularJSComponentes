import { createGridClient } from './grid-client.js';

export function createCrudClient(api, configuration, environment) {
  environment = environment || {};
  var notify = environment.notify || function () {};
  var disposed = false;
  var queryVersion = 0;
  var client = {
    isFactoryDefault: true, CAMPO_INDEX: 'ID', ORDER_BY: 'ID', TIPO_ADD: 1, TIPO_GRAVAR: 1,
    factory_principal: 0, url_consultar: '', url_gravar: '', url_excluir: '', postfiles: false,
    FILTRO_DADOS: '', FILTRO_DADOS_ADD: '', DADOS: [], DADOS_RENDER: [], SELECTED: {}, SELECTEDS: [],
    BACKUP: {}, BACKUP_ITENS: [], BACKUP_ITENS_MARCADOS: [], ITENS: [], ITENS_EXCLUIDOS: [],
    INCLUINDO: false, ALTERANDO: false, COPIANDO: false, EXCLUINDO_MULTIPLOS: false,
    consultas: [], habilita_itens: false, manter_itens_marcados: true, atualizar_principal: false,
    merger_dados: true, merger_tabela: false, confirmar_gravar: true, confirmar_cancelar: true,
    force_confirmar_cancelar: false, confirmar_excluir: true, fechar_modal_incluir: true,
    ajax_new_job_gravar: false, ajax_new_job_consultar: false, ajax_new_job_excluir: false,
    see_active: false, see_type: 'logs', see_metodos: [], loading: false, error: null,
    MSG_GRAVAR: 'Deseja realmente gravar este registro?',
    setDadosIncluir: function () { return { DESCRICAO: '', STATUS: '1' }; },
    setDadosConsultar: function (data) { return data; }, setDadosFiltro: function (data) { return data; },
    init: function (table) { client.Modal.Pai = table; },
    setFactoryPrincipal: function (value) { client.factory_principal = value; },
    setNewJobAll: function (value) {
      ['ajax_new_job_gravar', 'ajax_new_job_consultar', 'ajax_new_job_excluir', 'ajax_new_job_excluir_mult', 'ajax_new_job_ItensDel', 'ajax_new_job_get_itens_add'].forEach(function (field) { client[field] = value; });
    },
    merge: function (rows) {
      client.beforeMerge(rows); client.DADOS = rows;
      client.formatDataMerge(client); client.formatDataMergeItens(client); client.Tabela.merge(client.DADOS);
      client.onMerge(); notify(); return rows;
    },
    consultar: function (event) {
      if (!validate('consultar', 'onValidarConsultar')) return Promise.resolve([]);
      if (event !== undefined) client.Tabela.consulta_pagina = 0;
      var filter = { FILTRO: client.FILTRO_DADOS, FILTRO_ADD: client.FILTRO_DADOS_ADD };
      var data = { FILTRO: filter, DADOS: Object.assign({}, filter) };
      client.setDadosConsultar(data);
      if (client.Tabela.infinite_scroll || client.Tabela.MODIFICAR_PAGINACAO) {
        data.FILTRO.QTD = client.Tabela.consulta_qtd;
        data.FILTRO.PAGINA = client.Tabela.consulta_qtd * client.Tabela.consulta_pagina;
      }
      var current = ++queryVersion;
      return operation(function () { return api.post(client.url_consultar, data, sendOptions('consultar')); }).then(function (rows) {
        if (current !== queryVersion || disposed) return rows;
        client.merge(rows);
        if (client.manter_itens_marcados && client.BACKUP_ITENS_MARCADOS.length) {
          var key = client.CAMPO_INDEX;
          client.DADOS = rows.filter(function (row) { return !client.BACKUP_ITENS_MARCADOS.some(function (item) { return item[key] == row[key]; }); }).concat(client.BACKUP_ITENS_MARCADOS);
          client.BACKUP_ITENS_MARCADOS.forEach(function (row) { row.CHECKED = true; }); client.Tabela.merge(client.DADOS);
        } else if (!client.manter_itens_marcados) client.BACKUP_ITENS_MARCADOS = [];
        client.fimConsultar(rows); notify(); return rows;
      }).catch(function (error) { client.fimConsultarOnReject(error); throw error; });
    },
    incluir: function () {
      if (!validate('incluir', 'onValidarIncluir')) return;
      client.BACKUP = {}; client.SELECTED = client.setDadosIncluir();
      flags(true, true, false);
      if (client.habilita_itens && client.Itens) { client.Itens.ITENS_EXCLUIDOS = []; client.Itens.merge([]); }
      client.consultas.forEach(function (item) { item.OBJ.apagar(); item.OBJ.Input.disabled = false; item.OBJ.btn_filtro.disabled = false; });
      client.Modal.show(); client.onIncluir(); notify();
    },
    incluirNovo: function () { client.Modal.hide(); return client.incluir(); },
    alterar: function () {
      if (!validate('alterar', 'onValidarAlterar')) return;
      client.BACKUP = angular.copy(client.SELECTED);
      if (client.habilita_itens && client.Itens) client.BACKUP_ITENS = angular.copy(client.Itens.DADOS);
      client.ALTERANDO = true; client.Modal.focus(); enableQueries(); client.onAlterar(); notify();
    },
    copiar: function () {
      if (!validate('copiar', 'onValidarCopiar')) return;
      client.BACKUP = angular.copy(client.SELECTED); client.SELECTED = angular.copy(client.SELECTED);
      client.BACKUP_ID_COPY = client.SELECTED[client.CAMPO_INDEX];
      var id = client.TIPO_ADD === 2 ? Math.min.apply(null, [-client.DADOS.length - 1].concat(client.DADOS.map(function (row) { return (Number(row[client.CAMPO_INDEX]) || 0) - 1; }))) : undefined;
      client.SELECTED[client.CAMPO_INDEX] = id; client.SELECTED['DESC_' + client.CAMPO_INDEX] = id;
      if (client.habilita_itens && client.Itens) {
        client.BACKUP_ITENS = angular.copy(client.Itens.DADOS);
        client.Itens.DADOS.forEach(function (row, index) { row.ID = -index - 1; row.DESC_ID = undefined; });
      }
      flags(true, false, true); enableQueries(); client.Modal.focus(); client.onCopiar(); notify();
    },
    cancelar: function () {
      var changed = JSON.stringify(client.SELECTED) !== JSON.stringify(client.BACKUP);
      return confirm((changed && client.confirmar_cancelar) || client.force_confirmar_cancelar, 'Deseja realmente cancelar esta operação?').then(function (approved) {
        if (!approved) return false;
        if (Object.keys(client.BACKUP).length) Object.assign(client.SELECTED, angular.copy(client.BACKUP));
        if (client.habilita_itens && client.Itens) { client.Itens.merge(angular.copy(client.BACKUP_ITENS)); client.Itens.ITENS_EXCLUIDOS = []; }
        if (client.INCLUINDO || client.EXCLUINDO_MULTIPLOS) client.Modal.hide();
        client.beforeCancelar(); flags(false, false, false); client.onCancelar(); notify(); return true;
      });
    },
    gravar: function () {
      if (!validate('gravar', 'onGravar')) return Promise.resolve(false);
      return confirm(client.confirmar_gravar, client.MSG_GRAVAR).then(function (approved) {
        if (!approved) { client.onCancelarGravar(); return false; } return client.confirmarGravar();
      });
    },
    confirmarGravar: function () {
      client.consultas.forEach(function (item) {
        var selected = item.OBJ.item.selected ? item.OBJ.item.dados : undefined;
        client.SELECTED[item.NOME] = selected; client.SELECTED[item.NOME + '_BKP'] = selected;
        client.SELECTED[item.NOME + '_JSON'] = selected ? JSON.stringify(selected) : '';
      });
      client.beforeConfirmarGravar();
      if (client.habilita_itens && client.Itens && client.Itens.TIPO_ADD === 2) {
        client.SELECTED.GRAVAR_ITENS = client.Itens.DADOS; client.SELECTED.ITENS_EXCLUIDOS = client.Itens.ITENS_EXCLUIDOS;
      }
      var data = client.setDadosFiltro({ FILTRO: { FILTRO: client.FILTRO_DADOS, FILTRO_ADD: client.FILTRO_DADOS_ADD }, DADOS: client.SELECTED });
      client.onConfirmarGravar();
      var local = client.TIPO_ADD === 2 || client.TIPO_GRAVAR === 2;
      return operation(function () {
        if (local) return { ID_RETURN: client.SELECTED[client.CAMPO_INDEX], DATA_RETURN: [angular.copy(client.SELECTED)] };
        return api[client.postfiles ? 'postFile' : 'post'](client.url_gravar, data, sendOptions('gravar'));
      }).then(function (response) {
        client.execPrePosGravar(response); client.beforeFimGravar();
        var returned = response.DATA_RETURN || [];
        if (client.merger_dados && !local) client.merge(returned);
        else {
          returned.forEach(function (row) {
            var index = client.DADOS.findIndex(function (item) { return item[client.CAMPO_INDEX] == row[client.CAMPO_INDEX]; });
            if (index >= 0) client.DADOS[index] = row; else client.DADOS.push(row);
          });
          client.Tabela.merge(client.DADOS);
        }
        if (returned.length) client.SELECTED = returned.find(function (row) { return row[client.CAMPO_INDEX] == response.ID_RETURN; }) || returned[0];
        flags(false, false, false); if (client.fechar_modal_incluir) client.Modal.hide();
        client.fimGravar(response); notify(); return response;
      }).catch(function (error) { client.executeOnReject(error); throw error; });
    },
    excluir: function () {
      if (!validate('excluir', 'onExcluir')) return Promise.resolve(false);
      return confirm(client.confirmar_excluir, 'Deseja realmente excluir este registro?').then(function (approved) { return approved ? client.confirmarExcluir() : false; });
    },
    confirmarExcluir: function () {
      client.onConfirmarExcluir();
      var selected = client.SELECTED;
      var data = client.setDadosFiltro({ FILTRO: { FILTRO: client.FILTRO_DADOS, FILTRO_ADD: client.FILTRO_DADOS_ADD }, DADOS: selected });
      return operation(function () {
        if (client.TIPO_ADD === 2) return {};
        return api.post(client.url_excluir, data, sendOptions('excluir'));
      }).then(function (response) {
        client.ITENS_EXCLUIDOS.push(angular.copy(selected));
        client.DADOS = client.DADOS.filter(function (row) { return row[client.CAMPO_INDEX] != selected[client.CAMPO_INDEX]; });
        client.Tabela.merge(client.DADOS); client.SELECTED = {}; client.Modal.hide(); client.fimExcluir(response); notify(); return response;
      });
    },
    visualizar: function (row) {
      if (row) client.SELECTED = row;
      client.validar_visualizar = true; client.validarVisualizar();
      if (!client.validar_visualizar) return;
      client.BACKUP = angular.copy(client.SELECTED); client.Modal.show(); client.onVisualizar(); notify();
    },
    fecharModal: function () { client.Modal.hide(); client.onFecharModal(); },
    limparTabela: function () { return client.merge([]); },
    nextRecord: function () { var result = client.Tabela.next(client.SELECTED); if (result.POS) client.SELECTED = result.ITEM; client.onNextRecord(result); notify(); return result; },
    previousRecord: function () { var result = client.Tabela.previous(client.SELECTED); if (result.POS) client.SELECTED = result.ITEM; client.onPreviousRecord(result); notify(); return result; },
    destroy: function () { disposed = true; ++queryVersion; client.Tabela.destroy(); }
  };
  [
    'beforeMerge', 'formatDataMerge', 'formatDataMergeItens', 'onMerge', 'fimConsultar', 'fimConsultarOnReject',
    'onValidarConsultar', 'onValidarIncluir', 'onValidarAlterar', 'onValidarCopiar', 'onIncluir', 'onAlterar',
    'onCopiar', 'onCancelar', 'beforeCancelar', 'beforeConfirmarGravar', 'beforeFimGravar', 'execPrePosGravar',
    'onGravar', 'onConfirmarGravar', 'onCancelarGravar', 'fimGravar', 'executeOnReject', 'onExcluir',
    'onConfirmarExcluir', 'fimExcluir', 'onVisualizar', 'validarVisualizar', 'onFecharModal', 'onShowModal', 'onHideModal', 'onNextRecord', 'onPreviousRecord'
  ].forEach(function (name) { client[name] = function () {}; });
  client.Modal = {
    Pai: client, isShown: false, preventAutoFocus: false,
    getFactoryPai: function () { return client; },
    focus: function () { if (environment.focus) environment.focus(); },
    show: function (shown, hidden) { client.Modal.isShown = true; client.Modal.onHidden = hidden; client.onShowModal(); if (shown) shown(); notify(); },
    hide: function (hidden) { client.Modal.isShown = false; client.onHideModal(); if (hidden) hidden(); if (client.Modal.onHidden) client.Modal.onHidden(); notify(); }
  };
  client.Tabela = createGridClient({}, { notify: notify });
  Object.assign(client, configuration || {});
  function validate(action, hook) { client['validar_' + action] = true; client[hook](); return client['validar_' + action] === true; }
  function flags(editing, adding, copying) { client.ALTERANDO = editing; client.INCLUINDO = adding; client.COPIANDO = copying; client.EXCLUINDO_MULTIPLOS = false; }
  function enableQueries() { client.consultas.forEach(function (item) { if (item.ALTERAR !== false) { item.OBJ.btn_apagar_filtro.disabled = false; item.OBJ.Input.disabled = false; item.OBJ.btn_filtro.disabled = false; } }); }
  function confirm(required, message) {
    if (!required) return Promise.resolve(true);
    if (!environment.confirm) return Promise.reject(new Error('Configure a confirmacao declarativa para esta operacao.'));
    return Promise.resolve(environment.confirm(message, client));
  }
  function sendOptions(action) {
    var result = { new_job: !!client['ajax_new_job_' + action] };
    if (client.see_active) Object.assign(result, { see: true, seeType: client.see_type, metodos: angular.copy(client.see_metodos), seeProgress: client.see_metodos.length === 0, scope: environment.scope });
    return result;
  }
  function operation(callback) {
    if (disposed) return Promise.reject(new Error('CRUD destruido.'));
    client.loading = true; client.error = null; notify();
    return Promise.resolve().then(callback).catch(function (error) { client.error = error; throw error; })
      .finally(function () { client.loading = false; if (!disposed) notify(); });
  }
  return client;
}
