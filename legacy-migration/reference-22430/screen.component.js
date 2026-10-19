import template from './screen.html';
import styles from './screen.css';
import { modelColumns } from './columns.js';
import { endpoint, modelRequest } from './contract.js';
import { lookupEndpoints } from './backend.js';

export default EasyComponents.defineComponent('reference-22430', {
  inject: { api: 'GcApi', backend: 'Gc22430Backend' },
  state: function () {
    return { grid: null, gridConfig: {}, lookupDefinitions: [], lookups: {}, error: '', filtersOpen: true, filesRow: null,
      form: { TIPODATA: '1', PERIODO_INICIAL: new Date(2000, 0, 1), PERIODO_FINAL: new Date(2999, 11, 31), FILTRO_STATUS: '1',
        TIPO_MODELO: '', FILTRO_ECOMMERCE: '', FILTRO_PUBLICA_ECOM: '', FILTRO_MARCA: '', FILTRO_BLOQ_PED: '', FILTRO_DADOS: '', FILTRO_CODIGO: '', FLAG_MODELO: false, VISUALIZAR_REFERENCIA: false } };
  },
  methods: {
    lookupReady: function (key, lookup) { this.lookups[key] = lookup; },
    gridReady: function (grid) { this.grid = grid; return this.consultar(); },
    consultar: function () { this.error = ''; return this.grid.loadPage(0, false).catch(this.reportError.bind(this)); },
    reportError: function (error) { this.$setState({ error: error.message || 'Falha na consulta.' }); },
    clearLookup: function () { if (this.grid) this.grid.apagar(); },
    openFiles: function (row) { this.filesRow = row; },
    keydown: function (event) { if (event.altKey && event.key.toLowerCase() === 'f') { event.preventDefault(); this.consultar(); } }
  },
  hooks: {
    onInit: function () {
      var vm = this;
      var definitions = [
        ['TIPO', 'Tipo de Produto:', [['ID', 'ID'], ['DESCRICAO', 'DESCRIÇÃO'], ['DESC_CLASSE', 'CLASSE']], 450],
        ['FAMILIA_ID', 'Família Comercial:', [['ID', 'ID'], ['DESCRICAO', 'DESCRIÇÃO'], ['DESC_TIPOPRODUTO', 'TIPO DO PRODUTO']], 430],
        ['LINHA', 'Linha:', [['ID', 'ID'], ['DESCRICAO', 'DESCRIÇÃO']], 430],
        ['MATRIZ', 'Matriz:', [['DESC_ID', 'ID'], ['DESCRICAO', 'DESCRIÇÃO']], 430],
        ['PERFIL', 'Perfil:', [['ID', 'ID'], ['DESCRICAO', 'DESCRIÇÃO'], ['FAMILIA', 'FAMÍLIA']], 430],
        ['CATEGORIA', 'Categoria:', [['DESC_ID', 'ID'], ['DESCRICAO', 'DESCRIÇÃO'], ['API_DESCRICAO', 'E-COMMERCE']], 400]
      ];
      vm.lookupDefinitions = definitions.map(function (definition) {
        return { key: definition[0], label: definition[1], config: { cache: definition[0] !== 'LINHA' && definition[0] !== 'CATEGORIA', autoload: false,
          option: { obj_consulta: lookupEndpoints[definition[0]], campos_tabela: definition[2], tamanho_tabela: definition[3],
            obj_ret: [definition[0] === 'MATRIZ' || definition[0] === 'CATEGORIA' ? 'DESC_ID' : 'ID', 'DESCRICAO'],
            filtro_sql: { STATUS: 1 }, required: false, infinite_scroll: true } } };
      });
      var options = [{ icone: 'glyphicon glyphicon-th-list', type: 'btn-default toggle', label: '', dropdown: true,
        visible: function () { return true; }, disabled: function () { return false; }, readonly: function () { return false; },
        menu_drop: { DESC: 'Ações Disponíveis', OPCAO: [{ desc: 'Visualizar Arquivos da Ficha de Processo', icon: 'glyphicon glyphicon-list-alt',
          funcao: function (event, row) { vm.openFiles(row); }, visible: function () { return true; } }] } }];
      var flags = { TIPOPRODUTO_CODIGO: true, MATRIZ_CODIGO: false, PERFIL: true, DENSIDADE: true, ESPESSURA: false, TIPO_TAG: false };
      var columns = modelColumns({ MODELOS_CARTAO_TAREFAS: { HABILITADA: false }, VISUALIZAR_REFERENCIA: false }, flags, options, {});
      var blockedStyle = { funcao: function (row) { return row.BLOQ_PED == 1 ? 'background-color:#f2dede!important;color:#a94442!important;' : ''; } };
      // Convert the five HTML/popover factories into explicit text, code and popover bindings.
      var hints = { HINT_TIPO: 'TIPOPRODUTO_CODIGO', HINT_FAMILIA: 'FAMILIA_CODIGO', HINT_LINHA: 'LINHA_CODIGO', HINT_MATRIZ: 'MATRIZ_CODIGO', HINT_COR_PADRAO: 'COR_PADRAO' };
      columns.forEach(function (column) {
        column.STYLE_OPT = blockedStyle;
        if (hints[column.CAMPO]) {
          var source = hints[column.CAMPO], hint = column.CAMPO;
          column.TIPO = 'string'; column.TITLE = function (row) { return row[hint]; };
          column.POPOVER = function (row) { return row[hint]; };
          column.format = function (value, row) { return row[hint] ? String(row[source] == null ? '' : row[source]).padStart(4, '0') : ''; };
        }
      });
      vm.gridConfig = { ID: '22430_TBMODELO', titulo: '22430 - Cadastro de Modelos e Fichas Técnicas',
        COLUNAS: columns, filtro: ' ', ORDER_BY: 'ID', zoom: 100, HEIGHT: 'calc(100vh - 360px)',
        infinite_scroll: true, filtro_visible: false, status_visible: true, status_style: blockedStyle,
        total_visible: false, total_registros: true, consulta_qtd: 50,
        model_tabela: { consultar: function () {
          var data = modelRequest(vm.form, vm.lookups, vm.grid.consulta_pagina, vm.grid.consulta_qtd);
          return vm.api.post(endpoint, data).then(function (response) { return response.DADOS; });
        } } };
    }
  },
  template: template, styles: styles, scoped: true
});
