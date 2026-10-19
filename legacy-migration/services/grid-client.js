import { formatGridValue, gridNumber, validGridValue, gridLink, gridGradient } from './grid-cell-contract.js';
import { createGridDefaults } from './grid-defaults.js';
import { mergeGridData, joinGridRows } from './grid-data-contract.js';
function clone(value) { return angular.copy(value); }
function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
// Native rendering of the declarative BTN3 contract (no jQuery or generated $compile).
export function gridMenu(button) {
  var menu = button.menu_drop || {}, result = [], number = 0;
  (menu.GRUPOS && menu.GRUPOS.length ? menu.GRUPOS : [menu]).forEach(function (group) {
    if (group.DESC) result.push({ _MENU_TIPO: 'CABECALHO', desc: group.DESC });
    (group.OPCAO || []).forEach(function (option) {
      result.push(Object.assign({}, option, { _MENU_TIPO: 'OPCAO', _MENU_NUMERO: ++number }));
    });
  });
  return result;
}
export function gridCellStyle(column, row, grid, header) {
  var style = 'text-align:' + (column.ALIGN || column.align || 'left') + ';';
  if (column.width) style += 'min-width:' + column.width + ';max-width:' + column.width + ';';
  if (column.SIZE && column.SIZE !== '0') style += 'width:' + column.SIZE + ';';
  style += (column.STYLE || '') + ';' + (header ? column.STYLE_HEADER || '' : column.STYLE_CELL || '') + ';';
  if (!header && row) {
    if (column.STYLE_OPT) style += column.STYLE_OPT.funcao(row) + ';';
    if (column.STYLE_OPT_PARAM) style += column.STYLE_OPT_PARAM.funcao(row, column.PARAM_STYLE) + ';';
    if (grid && grid.opt_style) style += grid.opt_style.funcao(row) + ';';
    if (row.ESTILOS_CALCULADOS) style += (row.ESTILOS_CALCULADOS[column.key || column.CAMPO] || '') + ';';
  }
  return style;
}
export function normalizeColumns(columns) {
  return (columns || []).map(function (column, index) {
    return Object.assign({}, column, { key: column.key || column.CAMPO, id: column.CHAVE_COLUNA || (column.key || column.CAMPO) + '_' + index, label: column.label || column.DESCRICAO || column.CAMPO,
      visible: !column.HIDDEN && (column.visible === undefined ? (column.VISIBLE === undefined || !!column.VISIBLE) : column.visible),
      width: column.width || column.SIZE_CELL, type: column.type || column.TIPO || 'string',
      sortable: column.sortable === undefined ? column.TIPO !== 'btn3' : column.sortable,
      order: column.order === undefined ? (column.ORDEM === undefined ? index : Number(column.ORDEM)) : column.order });
  }).sort(function (left, right) { return left.order - right.order; });
}
export function createGridClient(configuration, environment) {
  environment = environment || {};
  var notify = environment.notify || function () {};
  var disposed = false;
  var requestVersion = 0;
  var originalColumns;
  var timers = new Set();
  function later(callback, delay) {
    var task = (environment.schedule || function (fn, ms) { return typeof setTimeout === 'function' ? setTimeout(fn, ms) : Promise.resolve().then(fn); })(function () { timers.delete(task); if (!disposed) callback(); }, delay);
    timers.add(task); return task;
  }
  var client = {
    ID: '', model: '', componente: '', titulo: '', filtro: '', FILTRO: {}, ORDER_BY: '',
    DADOS: [], DADOS_RENDER: [], DADOS_RENDER_FILTRADOS: [], SELECTED: {}, COLUNAS: [],
    campo_model: 'item.CHECKED', filtro_visible: true, consulta_pagina: 0, consulta_qtd: 50,
    infinite_scroll: false, infinite_end: false, counter_selected: 0, loading: false,
    zoom: 100, HEIGHT: '520px', WIDTH: '100%', total_visible: false, check_list: true,
    backup_colunas: [], bkp_colunas_edit: [], CABECALHO_CSV: 1, csv_com_bom: true,
    onMarcar: function () {}, validarMarcarItem: function () { return true; },
    onMergeEnd: null, fimcountmarcados: null, groupBy: [], collapsedGroups: new Set(),
    setData: function (data) { Object.assign(client, data); notify(); return client; },
    merge: function (rows) {
      mergeGridData(client, rows); client.FiltrarTabela();
      if (client.linhas_marcadas) {
        var markLoaded = function () {
          var field = String(client.campo_model).replace('item.', '').trim();
          (client.filtro_visible ? client.DADOS_RENDER : client.DADOS).forEach(function (row) { row[field] = true; if (client.validar_marcar_todos) client.onMarcar(row); });
          if (!client.validar_marcar_todos) client.onMarcar();
        };
        if (client.filtro_visible) later(markLoaded, 300); else markLoaded();
      }
      if (client.total_visible) client.TotalTabela();
      if (client.onMergeEnd) later(function () { client.onMergeEnd(); }, 300);
      notify();
    },
    MergeDados: joinGridRows,
    apagar: function () {
      ++requestVersion;
      client.FILTRO = ''; client.DADOS = []; client.DADOS_RENDER = []; client.DADOS_RENDER_FILTRADOS = [];
      client.DADOS_AGRUPAMENTO = []; client.total_dados = 0; client.counter_selected = 0;
      client.infinite_end = false; client.linhas_marcadas = false; client.consulta_pagina = 0;
      client.loading = false;
      if (client.total_visible) client.TotalTabela(); notify();
    },
    getColuns: function () { return client.COLUNAS; },
    getDadosRender: function () { return client.DADOS_RENDER; },
    FiltrarTabela: function () {
      var query = String(client.filtro || '').toLowerCase();
      var columns = normalizeColumns(client.COLUNAS);
      client.DADOS_RENDER = client.DADOS.filter(function (row) {
        return (!query || columns.some(function (column) { return String(row[column.key] == null ? '' : row[column.key]).toLowerCase().indexOf(query) !== -1; })) &&
          Object.keys(client.FILTRO || {}).every(function (field) {
            var value = client.FILTRO[field];
            return value === '' || value == null || String(row[field]).toLowerCase().indexOf(String(value).toLowerCase()) !== -1;
          });
      });
      if (client.ORDER_BY) {
        var orders = String(client.ORDER_BY).split(',').map(function (field) { var parts = field.trim().split(/\s+/); return { field: parts[0].replace(/^-/, ''), direction: /^-/.test(parts[0]) || parts[1] === 'DESC' ? -1 : 1 }; });
        client.DADOS_RENDER.sort(function (left, right) {
          for (var i = 0; i < orders.length; i++) {
            var order = orders[i], a = left[order.field], b = right[order.field];
            if (a !== b) return (a == null ? -1 : b == null ? 1 : a < b ? -1 : 1) * order.direction;
          }
          return 0;
        });
      }
      client.DADOS_RENDER_FILTRADOS = client.DADOS_RENDER;
      client.count_marcados(); notify(); return client.DADOS_RENDER;
    },
    OrderTabela: function (field, direction) { client.ORDER_BY = field + (direction === 'desc' ? ' DESC' : ''); return client.FiltrarTabela(); },
    count_marcados: function () {
      var field = client.campo_model.substring(client.campo_model.indexOf('.') + 1);
      client.counter_selected = (client.filtro_visible ? client.DADOS_RENDER : client.DADOS).filter(function (row) { return row[field] == true; }).length;
      if (client.fimcountmarcados) client.fimcountmarcados();
      return client.counter_selected;
    },
    MarcarItens: function () { mark(true); if (client.onMarcarTodos) client.onMarcarTodos(); },
    DesmarcarItens: function () { mark(false); },
    setTableCheckList: function (field, model) {
      client.CheckSelect = function (row) {
        if (!client.validarMarcarItem(row)) row.CHECKED = false;
        var found = -1;
        client.ITENS_MARCADOS.forEach(function (item, index) { if (item[client.campo_check] == row[client.campo_check]) found = index; });
        if (row.CHECKED == true && found < 0) client.ITENS_MARCADOS.push(row);
        else if (row.CHECKED != true && found >= 0) client.ITENS_MARCADOS.splice(found, 1);
        client.fimCheckSelect();
      };
      client.onMarcar = function () { client.DADOS.forEach(function (row) { client.CheckSelect(row); }); };
      Object.assign(client, { campo_check: field, space_function: client.CheckSelect, input_visible: true, input_model: false,
        linhas_marcadas: false, status_visible: false, marcar_linhas: true, check_onfocus: true, model_tabela: client,
        input_function: client.model + '.CheckSelect(' + model + ');', ITENS_MARCADOS: [], campo_model: model + '.CHECKED', campo_verific: 'CHEC_MARCADOS' });
      notify();
    },
    fimCheckSelect: function () {},
    fimCompilar: function () {},
    disableTableCheckList: function () {
      client.CheckSelect = function () {}; client.onMarcar = function () {}; client.space_function = client.CheckSelect;
      Object.assign(client, { input_visible: false, input_model: false, linhas_marcadas: false, status_visible: true,
        marcar_linhas: false, check_onfocus: false, ITENS_MARCADOS: [], campo_verific: 'CHEC_MARCADOS' }); notify();
    },
    setColuna: function () {
      if (client.DADOS.length && !client.coluna_gerada) {
        client.COLUNAS = Object.getOwnPropertyNames(client.DADOS[0]).map(function (field, index) {
          var sample = client.DADOS.find(function (row) { return typeof row[field] === 'number' || typeof row[field] === 'string'; });
          var type = sample ? typeof sample[field] : 'string';
          return { CAMPO: field, DESCRICAO: client.descricoes.length ? client.descricoes[index][1] : field, TIPO: type,
            ALIGN: type === 'number' ? 'right' : 'left', VISIBLE: true, SIZE: 0, STYLE: '', ORDEM: client.descricoes.length ? client.descricoes[index][0] : index };
        });
      }
      client.coluna_gerada = true; notify();
    },
    setChangeCheck: function (check) { return parseInt(check) === 1 ? 0 : 1; },
    setRowChecked: function (row, value, runInputHandler) {
      var field = client.campo_model.substring(client.campo_model.indexOf('.') + 1);
      row[field] = !!value && client.validarMarcarItem(row);
      if (runInputHandler !== false) {
        if (typeof client.input_function === 'function') client.input_function(row);
        else if (client.check_onfocus && client.CheckSelect) client.CheckSelect(row);
      }
      client.count_marcados(); notify();
    },
    first: function () { return client.DADOS.length ? { ITEM: client.DADOS[0], POS: 1, PRIMEIRO: true, ULTIMO: false } : emptyPosition(); },
    last: function () { return client.DADOS.length ? { ITEM: client.DADOS[client.DADOS.length - 1], POS: client.DADOS.length - 1, PRIMEIRO: false, ULTIMO: true } : emptyPosition(); },
    next: function (row) {
      var index = client.DADOS.findIndex(function (item) { return JSON.stringify(item) === JSON.stringify(row); });
      var position = index >= 0 && index + 1 < client.DADOS.length ? index + 2 : 0;
      return { ITEM: position ? client.DADOS[position - 1] : {}, POS: position, PRIMEIRO: position === 1, ULTIMO: position === client.DADOS.length };
    },
    nextReg: function (row) { return navigateId(row, false); },
    previousReg: function (row) { return navigateId(row, true); },
    previous: function (row) {
      var index = client.DADOS.findIndex(function (item, offset) { return offset > 0 && JSON.stringify(item) === JSON.stringify(row); });
      var position = index > 0 ? index + 1 : 0;
      return { ITEM: index > 0 ? client.DADOS[index - 1] : {}, POS: position, PRIMEIRO: position === 1, ULTIMO: position === client.DADOS.length };
    },
    TotalTabela: function () {
      var result = {};
      normalizeColumns(client.COLUNAS).filter(function (column) { return column.total || column.TOTAL; }).forEach(function (column) {
        result[column.key] = client.DADOS_RENDER.reduce(function (total, row) { return total + (Number(row[column.key]) || 0); }, 0);
      });
      return result;
    },
    groups: function () {
      function group(rows, level, prefix) {
        var field = client.groupBy[level];
        if (!field) return rows;
        var buckets = new Map();
        rows.forEach(function (row) { var value = row[field]; if (!buckets.has(value)) buckets.set(value, []); buckets.get(value).push(row); });
        return Array.from(buckets, function (entry) {
          var id = JSON.stringify(prefix.concat(entry[0]));
          return { id: id, field: field, value: entry[0], rows: entry[1], collapsed: client.collapsedGroups.has(id), children: group(entry[1], level + 1, prefix.concat(entry[0])) };
        });
      }
      return group(client.DADOS_RENDER, 0, []);
    },
    InvertGroup: function (group) { if (client.collapsedGroups.has(group.id)) client.collapsedGroups.delete(group.id); else client.collapsedGroups.add(group.id); notify(); },
    isValid: validGridValue,
    number_format: gridNumber,
    // Original public signature, with the previous native row overload retained.
    format: function (value, column, row) {
      if (arguments.length === 2 && value && typeof value === 'object') return client.formatCell(value, column);
      return formatGridValue(value, column, row);
    },
    formatCell: function (row, column) {
      var value = row[column.key || column.CAMPO];
      return typeof column.format === 'function' ? column.format(value, row, column) : client.format(value, column, row);
    },
    gerar_gradiente: gridGradient,
    open_link: function (link, parameters, row) {
      var url = gridLink(link, parameters, row);
      if (url === false) return false;
      if (parameters !== undefined && environment.open) environment.open(url, '_blank');
    },
    exportCsv: function (separator) { return exportDelimited(separator || ';'); },
    exportTXT: function () { return exportDelimited('\t'); },
    exportHTML: function () {
      var columns = normalizeColumns(client.COLUNAS).filter(function (column) { return column.visible; });
      return '<!doctype html><html><head><meta charset="utf-8"><title>' + escapeHtml(client.titulo) + '</title></head><body><table><thead><tr>' +
        columns.map(function (column) { return '<th>' + escapeHtml(column.label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        client.DADOS_RENDER.map(function (row) { return '<tr>' + columns.map(function (column) { return '<td>' + escapeHtml(client.format(row, column)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></body></html>';
    },
    imprimir: function () {
      if (!environment.print) throw new Error('Configure o adaptador de impressao.');
      return environment.print(client.exportHTML());
    },
    filterObjectsByProps: function (rows, fields) { return rows.map(function (row) { var result = {}; fields.forEach(function (field) { if (Object.prototype.hasOwnProperty.call(row, field)) result[field] = row[field]; }); return result; }); },
    setVisible: function (field, visible, identity) {
      if (arguments.length === 0) {
        client.COLUNAS.forEach(function (column) { column.VISIBLE = column.CHECKED == 1; delete column.visible; });
        if (client.filtro_visible) client.campos_filtro = client.COLUNAS.filter(function (column) { return column.VISIBLE; }).map(function (column) { return column.CAMPO; });
        if (client.REORDENAR && client.aplicarOrdem) client.aplicarOrdem();
        notify(); return;
      }
      return client.setColumnVisible(field, visible, identity);
    },
    setColumnVisible: function (field, visible, identity) {
      client.COLUNAS.forEach(function (column, index) {
        var id = column.CHAVE_COLUNA || (column.key || column.CAMPO) + '_' + index;
        if ((column.key || column.CAMPO) === field && (identity === undefined || identity === id)) { column.VISIBLE = visible; column.visible = visible; }
      }); notify();
    },
    removeColunas: function (fields) {
      client.COLUNAS = client.COLUNAS.filter(function (column) { return !fields.some(function (field) { return String(column.CAMPO == null ? '' : column.CAMPO).trim() === String(field == null ? '' : field).trim(); }); });
      client.FiltrarTabela();
    },
    restaurarColunas: function () { client.COLUNAS = clone(originalColumns); notify(); },
    setPersistentVisible: function () {
      if (!environment.api) return Promise.reject(new Error('Configure a API de persistencia de colunas.'));
      var changes = client.COLUNAS.filter(function (column) {
        var before = client.bkp_colunas_edit.find(function (item) { return item.CAMPO === column.CAMPO && item.CAMPO_FILTRO === column.CAMPO_FILTRO; });
        return before && (before.ORDEM !== column.ORDEM || before.VISIBLE !== column.VISIBLE);
      });
      if (!changes.length) return Promise.resolve(client.COLUNAS);
      return environment.api.post((environment.baseUrl || '') + '/api/controleTabela/gravarColunasVisiveis', {
        ITENS_MARCADOS: client.filterObjectsByProps(changes, ['DESCRICAO', 'CHECKED', 'VISIBLE', 'CAMPO', 'CAMPO_FILTRO', 'CHAVE_COLUNA', 'ORDEM']),
        TABELA_ID: client.ID, TIPO_PLATAFORMA: environment.mobile ? 1 : 0, MENU_CONTROLE: environment.menuControle || 0
      }).then(function (response) {
        (response.DATA_RETURN || []).forEach(function (saved) {
          var column = client.COLUNAS.find(function (item) { return item.CAMPO === saved.CAMPO && item.CAMPO_FILTRO === saved.CAMPO_FILTRO; });
          if (column) Object.assign(column, saved);
        });
        client.bkp_colunas_edit = []; client.backup_colunas = []; notify(); return response;
      });
    },
    NextPage: function () { return client.loading || client.infinite_end ? Promise.resolve([]) : client.loadPage(client.consulta_pagina + 1, client.infinite_scroll); },
    loadPage: function (page, append) {
      if (disposed) return Promise.reject(new Error('Tabela destruida.'));
      var loader = environment.load || (client.model_tabela && client.model_tabela.consultar && function () { return client.model_tabela.consultar(); });
      if (!loader) return Promise.reject(new Error('Configure o carregamento de paginas.'));
      var current = ++requestVersion;
      var previousPage = client.consulta_pagina;
      client.consulta_pagina = page; client.loading = true; notify();
      return Promise.resolve().then(function () { return loader({ PAGINA: page * client.consulta_qtd, QTD: client.consulta_qtd, FILTRO: client.filtro, ORDER_BY: client.ORDER_BY }); })
        .then(function (rows) {
          if (!disposed && current === requestVersion && Array.isArray(rows)) {
            if (!append && page !== 0) client.operacao_merge_gravar = true;
            client.merge(rows);
          }
          return rows;
        }).catch(function (error) { if (!disposed && current === requestVersion) client.consulta_pagina = previousPage; throw error; })
        .finally(function () { if (!disposed && current === requestVersion) { client.loading = false; notify(); } });
    },
    destroy: function () { disposed = true; ++requestVersion; timers.forEach(function (timer) { if (environment.cancel) environment.cancel(timer); else if (typeof clearTimeout === 'function') clearTimeout(timer); }); timers.clear(); }
  };
  function navigateId(selected, previous) {
    var index = client.DADOS.findIndex(function (row, offset) { return (!previous || offset > 0) && String(row.ID == null ? '' : row.ID).trim() !== '' && String(selected.ID == null ? '' : selected.ID).trim() !== '' && row.ID === selected.ID; });
    var has = previous ? index > 0 : index >= 0 && index < client.DADOS.length - 1;
    var position = has ? previous ? index + 1 : index + 2 : 0;
    return { ITEM: has ? client.DADOS[index + (previous ? -1 : 1)] : {}, POS: position, PRIMEIRO: position === 1, ULTIMO: position === client.DADOS.length };
  }
  function emptyPosition() { return { ITEM: {}, POS: 0, PRIMEIRO: false, ULTIMO: false }; }
  function mark(value) {
    (client.filtro_visible ? client.DADOS_RENDER : client.DADOS).forEach(function (row) {
      row[client.campo_model.substring(client.campo_model.indexOf('.') + 1)] = value && client.validarMarcarItem(row);
    });
    client.linhas_marcadas = value;
    if (client.model_tabela && client.campo_verific && Object.keys(client).some(function (key) { return String(client[key]).trim() === client.campo_verific; })) client.model_tabela[client.campo_verific] = value;
    if (!value && client.PaiTab) client.PaiTab.BACKUP_ITENS_MARCADOS = [];
    client.count_marcados(); client.onMarcar();
    if (!value && client.onDesmarcarTodos) client.onDesmarcarTodos(); notify();
  }
  function exportDelimited(separator) {
    function quote(value) { return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"'; }
    var columns = normalizeColumns(client.COLUNAS).filter(function (column) { return column.visible; });
    var lines = client.CABECALHO_CSV ? [columns.map(function (column) { return quote(column.label); }).join(separator)] : [];
    client.DADOS_RENDER.forEach(function (row) { lines.push(columns.map(function (column) { return quote(client.format(row, column)); }).join(separator)); });
    return (client.csv_com_bom ? '\uFEFF' : '') + lines.join('\r\n');
  }
  Object.assign(client, createGridDefaults(), configuration || {});
  originalColumns = clone(client.COLUNAS);
  client.FiltrarTabela();
  return client;
}
