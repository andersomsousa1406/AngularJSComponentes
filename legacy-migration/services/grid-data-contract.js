// Data phase of TabelaJS.merge (4039–4215), independent of its iframe/DOM phase.
export function mergeGridData(table, rows) {
  if (!Array.isArray(rows)) throw new TypeError('Os dados da tabela devem ser uma lista.');
  if (!table.array_numericos) table.array_numericos = [];
  if (!table.array_numericos.length) table.COLUNAS.forEach(function (column) { if (column.TIPO === 'number') table.array_numericos.push(column.CAMPO); });
  var reset = !table.infinite_scroll;
  if (table.infinite_scroll) {
    if (table.consulta_pagina === 0) {
      // Same reset as apagar(), without invalidating the request delivering this page.
      table.FILTRO = ''; table.DADOS = []; table.DADOS_RENDER = []; table.DADOS_RENDER_FILTRADOS = [];
      table.DADOS_AGRUPAMENTO = []; table.total_dados = 0; table.counter_selected = 0;
      table.infinite_end = false; table.linhas_marcadas = false; reset = true;
    }
    if (rows.length < table.consulta_qtd) table.infinite_end = true;
    else if (table.infinite_end) { if (rows.length) table.infinite_end = false; reset = true; }
    else table.infinite_end = false;
    if (table.operacao_merge_gravar) { reset = true; table.operacao_merge_gravar = false; }
    table.scroll_counter = 0;
  }
  table.array_numericos.forEach(function (field) { rows.forEach(function (row) { row[field] = Number(row[field]); }); });
  table.DADOS = reset ? rows : table.DADOS.concat(rows);
  table.total_dados = table.DADOS.length;
  table.DADOS.forEach(function (row) {
    table.COLUNAS.forEach(function (column) {
      if (column.URL_LINK === undefined || column.URL_LINK === null || column.URL_LINK === '' || column.URL_LINK === 'null') return;
      var field = '_LINK_' + column.CAMPO;
      if (row[field] === undefined) row[field] = column.URL_LINK;
      row['_V_LINK_' + column.CAMPO] = true;
      Object.keys(row).forEach(function (key) { row[field] = row[field].split('#' + key + '#').join(String(row['_V_TOT_' + key] === true ? row['_TOT_' + key] : row[key])); });
    });
  });
  if (table.infinite_scroll && table.model_tabela) table.model_tabela.DADOS = table.DADOS;
  table.consultando = false;
}
export function joinGridRows(origin, rows, fields) {
  if (rows.length) origin.forEach(function (target) {
    var match = rows.find(function (row) { return fields.every(function (field) { return row[field] !== undefined && row[field] == target[field]; }); });
    if (match) Object.assign(target, match);
  });
  return origin;
}
