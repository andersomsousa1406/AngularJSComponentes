function resolveFields(source, required) {
  var result = {};
  Object.keys(source || {}).forEach(function (key) {
    var value = source[key];
    if (Array.isArray(value)) {
      var model = required ? value[0].item.dados : value[0];
      result[key] = model && model[value[1]];
    } else result[key] = value;
  });
  return result;
}
export function lookupRequest(client) {
  var option = client.option;
  var data = { FILTRO: String(client.Input.value === undefined ? '' : client.Input.value).replace(/'/g, "''") };
  if (!Object.keys(option.data_request).length && !Object.keys(option.require_request).length) {
    data.OPTIONS = option.filtro_sql;
    data.ADD_FILTRO = option.filtro_consulta;
    data.PARAN = Object.assign({}, option.paran, resolveFields(option.imput_request, false));
    data.CONSULTA = { TIPO: option.consulta_tipo, PAGINA: option.consulta_pagina * option.consulta_qtd,
      QTD: option.consulta_qtd, INFINITE_SCROLL: option.infinite_scroll };
  } else Object.assign(data, resolveFields(option.data_request, false), resolveFields(option.require_request, true));
  return data;
}
export function createLookupClient(api, configuration, environment) {
  configuration = configuration || {};
  environment = environment || {};
  var notify = environment.notify || function () {};
  var version = 0;
  var disposed = false;
  var cache = environment.cache || new Map();
  var client = {
    model: '', componente: '', dados: [], selected: null, selecionado: false, focused: false,
    consultando: false, disabled: false, cache: true, autoload: true, autoclear: true,
    vinculoEnabled: true, actionsSelct: [], actionsClear: [], fimClear: null,
    onSelect: null, onSelectMultipla: null, onClear: null, onFilter: null, onMerge: null,
    onBeforeClear: function () {}, onFormatMerge: function () {}, onFindItem: function () {},
    fimConsultar: function () {}, beforeSearch: function () {}, onAutoFiltroFimished: function () {},
    require: null, require2: [], require_msg: '', validarInput: null, validar_consultar: true,
    item: { selected: false, dados: {} },
    Input: { disabled: false, readonly: false, focus: false, value: '' },
    tabela: { disabled: true, visivel: false, style: { 'max-height': '300px' } },
    btn_apagar_filtro: { disabled: true, visivel: false }, btn_filtro: { disabled: false, visivel: true },
    option: {
      campo_index: 'ID', cache_id: '', label_descricao: 'DEFAULT:', ttitle: '',
      obj_consulta: 'Ppcp/include/_22030-gp', obj_ret: ['ID', 'DESCRICAO'],
      campos_sql: ['ID', 'DESCRICAO'], campos_inputs: [['_id', 'ID'], ['_descricao', 'DESCRICAO']],
      filtro_sql: [['STATUS', '1'], ['ORDER', 'DESCRICAO,ID']], campos_tabela: [['ID', 'ID'], ['DESCRICAO', 'DESCRIÇÃO']],
      sub_visualizacao: [], tamanho_input: 'input-medio', tamanho_tabela: null, required: true,
      class: 'consulta_gp_grup', autofocus: false, selecionado: false, consulta_tipo: '',
      consulta_pagina: 0, consulta_qtd: 20, infinite_scroll: false, infinite_end: false,
      paran: [], data_request: {}, imput_request: {}, require_request: {}, input_width: '',
      placeholder: '', width: 0, filtro_consulta: {}, campo_filtro: 'ID', id_campo_vinc_c: 0, campo_gravar: ''
    },
    setData: function (data) {
      Object.keys(data || {}).forEach(function (key) {
        if (key === 'option' || key === 'Input' || key === 'tabela') Object.assign(client[key], data[key]);
        else client[key] = data[key];
      });
      notify(); return client;
    },
    setDataRequest: function (data) { client.option.data_request = data; },
    setRequireRequest: function (data) { client.option.require_request = data; },
    validar: function () {
      var required = Array.isArray(client.require) ? client.require : (client.require ? [client.require] : []);
      return required.every(function (dependency) { return dependency.selected != null; }) &&
        client.require2.every(function (dependency) {
          if (environment.resolveDependency) return environment.resolveDependency(dependency);
          return dependency.selected != null || !!(dependency.item && dependency.item.selected);
        });
    },
    validate: function () { return client.validar(); },
    validarConsultar: function () { client.validar_consultar = !client.disabled && !client.Input.disabled; return client.validar_consultar; },
    filtrar: function (scroll) {
      if (client.onBeforeFiltrar) client.onBeforeFiltrar();
      if (!client.validate() || (client.validarInput && !client.validarInput())) return Promise.resolve([]);
      return client.consultar(client, scroll);
    },
    consultar: function (object, scroll) {
      if (disposed) return Promise.reject(new Error('Consulta destruida.'));
      if (!client.validarConsultar()) return Promise.resolve([]);
      if (scroll === undefined) { client.option.consulta_pagina = 0; client.option.infinite_end = false; }
      client.beforeSearch();
      var data = lookupRequest(client);
      var key = client.option.cache_id + ':' + client.option.obj_consulta + ':' + JSON.stringify(data);
      var saved = client.cache && cache.get(key);
      var current = ++version;
      client.consultando = true; client.error = null; client.tabela.visivel = true; notify();
      var task = saved && saved.expires > Date.now() ? Promise.resolve(saved.rows.map(function (row) { return Object.assign({}, row); }))
        : Promise.resolve().then(function () { return api.post(client.option.obj_consulta, data, { progress: false }); });
      return task.then(function (response) {
        if (disposed || current !== version) return response;
        if (!Array.isArray(response)) throw new Error('A consulta deve retornar uma lista.');
        if (client.onFilter) client.onFilter();
        client.dados = scroll === undefined ? response : client.dados.concat(response);
        client.onFormatMerge(client.dados);
        client.option.infinite_end = response.length < client.option.consulta_qtd;
        client.id_cached = saved ? key : '0';
        if (client.cache && response.length > 1) cache.set(key, { rows: response.map(function (row) { return Object.assign({}, row); }), expires: Date.now() + 86400000 });
        if (client.onMerge && client.option.keepitopen) client.onMerge(client.dados);
        if (client.option.imput_request._VALUE_AUTO_FILTER) {
          client.option.imput_request._VALUE_AUTO_FILTER = null;
          client.dados.forEach(function (row) { client.selecionarItem(row); });
          client.onAutoFiltroFimished(); client.onAutoFiltroFimished = function () {};
        } else if (client.dados.length === 1) client.selecionarItem(client.dados[0]);
        else client.setFocusTabela();
        client.fimConsultar(); return response;
      }).catch(function (error) {
        if (!disposed && current === version) { client.error = error; if (environment.onError) environment.onError(error); }
        throw error;
      }).finally(function () { if (!disposed && current === version) { client.consultando = false; notify(); } });
    },
    onScrollEnd: function () {
      if (client.consultando || !client.option.infinite_scroll || client.option.infinite_end) return Promise.resolve([]);
      client.option.consulta_pagina++; return client.filtrar(true);
    },
    selecionarItem: function (row) {
      if (row.NOT_SELECTIVE_LINE_SEARCH == 1) return;
      if (client.option.keepitopen) { row.MARKED = true; selected(row); }
      else { client.setSelected(row); selected(row); }
      notify();
    },
    setSelected: function (row, description) {
      if (!row || !Object.keys(row).length) return;
      client.selected = row; client.item.dados = row; client.item.selected = true; client.selecionado = true;
      client.Input.readonly = true; client.tabela.visivel = false;
      client.btn_apagar_filtro.visivel = true; client.btn_apagar_filtro.disabled = false; client.btn_filtro.visivel = false;
      if (client.set_this) Object.assign(client, row);
      client.Input.value = client.option.obj_ret.map(function (field) { return row[field]; }).join(' - ');
      if (description === true) selected(row);
      client.setDefalt(); notify();
    },
    apagar: function (focus, withoutOnClear) {
      client.onBeforeClear(); ++version;
      client.selected = null; client.item = { selected: false, dados: {} }; client.selecionado = false;
      client.Input.value = ''; client.Input.readonly = false; client.dados = []; client.consultando = false;
      client.tabela.visivel = false; client.btn_apagar_filtro.visivel = false;
      client.btn_apagar_filtro.disabled = true; client.btn_filtro.visivel = true; client.btn_filtro.disabled = false;
      if (!withoutOnClear && client.onClear) client.onClear();
      client.actionsClear.forEach(function (action) { if (action) action(); });
      if (client.fimClear) client.fimClear();
      if (focus !== false) client.setFocusInput(); notify();
    },
    clear: function (focus, withoutOnClear) { return client.apagar(focus, withoutOnClear); },
    apagarCache: function () { cache.clear(); client.id_cached = '0'; },
    disable: function (value) { client.disabled = value; client.Input.disabled = value; notify(); },
    focus: function () { client.setFocusInput(); },
    setFocusInput: function () { if (environment.focus) environment.focus('input'); },
    setFocusTabela: function () { if (environment.focus) environment.focus('table'); },
    setErro: function (message) { client.error = message; notify(); },
    setAlert: function (message) { client.error = message; notify(); },
    setDefalt: function () { client.error = null; notify(); },
    destroy: function () { disposed = true; ++version; cache.clear(); }
  };
  function selected(row) {
    if (client.vinculoEnabled) {
      if (client.onSelect) client.onSelect(row);
      if (client.onSelectMultipla) client.onSelectMultipla(row);
      if (!client.option.keepitopen) client.actionsSelct.forEach(function (action) { if (action) action(); });
    }
    client.onFindItem();
  }
  ['Tabela', 'Form', 'Input', 'Button', 'PesqContainer'].forEach(function (name, index) {
    client['getClass' + name] = function () { return client.option.class + ['_tabela', '_forme', '_Input', '_button', '_pesqc'][index]; };
  });
  client.getClassFiltro = function (variable) { return variable === undefined ? client.option.class + '_filtro' : 'consulta-sub-filtro-' + variable; };
  client.setData(configuration);
  return client;
}
