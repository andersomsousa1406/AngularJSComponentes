function clone(value) { return angular.copy(value); }
function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
export function normalizeColumns(columns) {
  return (columns || []).map(function (column, index) {
    return Object.assign({}, column, { key: column.key || column.CAMPO, label: column.label || column.DESCRICAO || column.CAMPO,
      visible: column.visible === undefined ? column.VISIBLE !== false : column.visible,
      width: column.width || column.SIZE_CELL, type: column.type || column.TIPO || 'string',
      order: column.order === undefined ? (column.ORDEM === undefined ? index : Number(column.ORDEM)) : column.order });
  }).sort(function (left, right) { return left.order - right.order; });
}
export function createGridClient(configuration, environment) {
  environment = environment || {};
  var notify = environment.notify || function () {};
  var disposed = false;
  var requestVersion = 0;
  var originalColumns;
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
      if (!Array.isArray(rows)) throw new TypeError('Os dados da tabela devem ser uma lista.');
      client.DADOS = rows; client.FiltrarTabela(); if (client.onMergeEnd) client.onMergeEnd(); notify(); return rows;
    },
    MergeDados: function (rows) { return client.merge(rows); },
    apagar: function () { return client.merge([]); },
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
    setChangeCheck: function (row, value) {
      var field = client.campo_model.substring(client.campo_model.indexOf('.') + 1);
      row[field] = !!value && client.validarMarcarItem(row); client.count_marcados(); client.onMarcar(); notify();
    },
    first: function () { return client.DADOS.length ? { ITEM: client.DADOS[0], POS: 1, PRIMEIRO: true, ULTIMO: false } : emptyPosition(); },
    last: function () { return client.DADOS.length ? { ITEM: client.DADOS[client.DADOS.length - 1], POS: client.DADOS.length - 1, PRIMEIRO: false, ULTIMO: true } : emptyPosition(); },
    next: function (row) {
      var index = client.DADOS.findIndex(function (item) { return JSON.stringify(item) === JSON.stringify(row); });
      var position = index >= 0 && index + 1 < client.DADOS.length ? index + 2 : 0;
      return { ITEM: position ? client.DADOS[position - 1] : {}, POS: position, PRIMEIRO: position === 1, ULTIMO: position === client.DADOS.length };
    },
    previous: function (row) {
      var index = client.DADOS.findIndex(function (item) { return JSON.stringify(item) === JSON.stringify(row); });
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
    format: function (row, column) {
      var field = column.key || column.CAMPO;
      var value = row[field];
      if (typeof column.format === 'function') return column.format(value, row, column);
      if (value == null) return '';
      var type = column.type || column.TIPO;
      if (type === 'number') value = Number(value).toLocaleString('pt-BR', { minimumFractionDigits: column.DECIMAL || 0, maximumFractionDigits: column.DECIMAL || 0 });
      else if (type === 'boolean') value = value ? 'Sim' : 'Não';
      else if (type === 'date') { var date = new Date(value); value = Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR'); }
      return (column.PREFIXO || '') + value + (column.SUFIXO || '');
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
    setVisible: function (field, visible) {
      client.COLUNAS.forEach(function (column) { if ((column.key || column.CAMPO) === field) { column.VISIBLE = visible; column.visible = visible; } }); notify();
    },
    removeColunas: function (fields) { fields.forEach(function (field) { client.setVisible(field, false); }); },
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
    NextPage: function () { return client.loadPage(client.consulta_pagina + 1, client.infinite_scroll); },
    loadPage: function (page, append) {
      if (disposed) return Promise.reject(new Error('Tabela destruida.'));
      var loader = environment.load || (client.model_tabela && client.model_tabela.consultar && function () { return client.model_tabela.consultar(); });
      if (!loader) return Promise.reject(new Error('Configure o carregamento de paginas.'));
      var current = ++requestVersion;
      client.consulta_pagina = page; client.loading = true; notify();
      return Promise.resolve().then(function () { return loader({ PAGINA: page * client.consulta_qtd, QTD: client.consulta_qtd, FILTRO: client.filtro, ORDER_BY: client.ORDER_BY }); })
        .then(function (rows) {
          if (!disposed && current === requestVersion && Array.isArray(rows)) {
            client.infinite_end = rows.length < client.consulta_qtd;
            client.merge(append ? client.DADOS.concat(rows) : rows);
          }
          return rows;
        }).finally(function () { if (!disposed && current === requestVersion) { client.loading = false; notify(); } });
    },
    destroy: function () { disposed = true; ++requestVersion; }
  };
  function emptyPosition() { return { ITEM: {}, POS: 0, PRIMEIRO: false, ULTIMO: false }; }
  function mark(value) {
    (client.filtro_visible ? client.DADOS_RENDER : client.DADOS).forEach(function (row) {
      row[client.campo_model.substring(client.campo_model.indexOf('.') + 1)] = value && client.validarMarcarItem(row);
    });
    client.count_marcados(); client.onMarcar(); notify();
  }
  function exportDelimited(separator) {
    function quote(value) { return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"'; }
    var columns = normalizeColumns(client.COLUNAS).filter(function (column) { return column.visible; });
    var lines = client.CABECALHO_CSV ? [columns.map(function (column) { return quote(column.label); }).join(separator)] : [];
    client.DADOS_RENDER.forEach(function (row) { lines.push(columns.map(function (column) { return quote(client.format(row, column)); }).join(separator)); });
    return (client.csv_com_bom ? '\uFEFF' : '') + lines.join('\r\n');
  }
  Object.assign(client, configuration || {});
  originalColumns = clone(client.COLUNAS);
  client.FiltrarTabela();
  return client;
}
