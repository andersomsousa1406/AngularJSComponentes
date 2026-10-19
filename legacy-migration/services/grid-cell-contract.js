// Contracts translated from TabelaJS.default_table.format/number_format/getCampo,
// gerar_gradiente and open_link. This module does not load the original engine.
export function validGridValue(value) {
  return value !== null && value !== undefined && value !== 'null' && value !== 'undefined' && value !== '';
}
export function gridNumber(number, decimals, point, separator) {
  var cleaned = String(number).replace(/[^0-9+\-Ee.]/g, '');
  var numeric = !Number.isNaN(parseFloat(cleaned)) && Number.isFinite(Number(cleaned)) ? cleaned : 0;
  // The legacy helper truncates before formatting; Intl rounding is not equivalent.
  var match = String(numeric).match(new RegExp('^-?\\d+(?:.\\d{0,' + (decimals || -1) + '})?'));
  if (!match) throw new TypeError('Numero fora do formato aceito pela tabela.');
  var value = Number.isFinite(Number(match[0])) ? Number(match[0]) : 0, precision = Number.isFinite(+decimals) ? Math.abs(decimals) : 0;
  var parts = (precision ? value.toFixed(precision) : String(Math.round(value))).split('.');
  parts[0] = parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, separator === undefined ? ',' : separator);
  if ((parts[1] || '').length < precision) parts[1] = (parts[1] || '').padEnd(precision, '0');
  return parts.join(point === undefined ? '.' : point);
}
export function formatGridValue(value, column, row) {
  row = row || {};
  try {
    if (!validGridValue(value)) value = '';
    else {
      var type = column.TIPO || column.type;
      if (type === 'number') value = gridNumber(value, column.DECIMAL, ',', '.');
      else if (type === 'date' || type === 'timestamp') {
        var parts = String(value).split(' '), date = type === 'timestamp' ? parts[0] : String(value);
        date = date.includes('-') ? date.split('-').reverse().join('/') : (type === 'date' && (value === 0 || value === false) ? '' : date.split('.').reverse().join('/'));
        value = type === 'timestamp' ? date + ' ' + String(parts[1]).substring(0, 5) : date;
      } else if (type === 'time') value = String(value).substring(0, 5);
    }
  } catch (_) { value = String(value); }
  function affix(text) {
    var trimmed = String(text).trim();
    if (trimmed[0] === '#' && trimmed[trimmed.length - 1] === '#') {
      var field = trimmed.substring(1, trimmed.length - 1);
      if (row[field] != null) return row[field];
    }
    return text;
  }
  if (column.INPUT == null && String(value).trim() !== '') {
    if (validGridValue(column.PREFIXO)) value = affix(column.PREFIXO) + ' ' + value;
    if (validGridValue(column.SUFIXO)) value = value + ' ' + affix(column.SUFIXO);
  }
  return value;
}
export function gridLink(link, parameters, row) {
  if (!String(link || '').trim()) return false;
  (parameters || []).forEach(function (parameter) {
    var value = parameter.CAMPO !== undefined && Object.prototype.hasOwnProperty.call(row, parameter.CAMPO) ? row[parameter.CAMPO] : parameter.VALUE;
    link = link.replace('#' + parameter.PARAM + '#', value);
  });
  return link;
}
export function gridGradient(colors) {
  if (colors == null || colors.length === 1) return 'background-color: #000000;';
  if (!colors.length) return ';';
  return 'background: ' + Array.from(colors, function (color, index) {
    var stop = ((index + 1) * (100 / colors.length)) + '%';
    return 'linear-gradient(110deg,' + color + ' ' + stop + ', rgba(0, 0, 0, 0) ' + stop + ')';
  }).join(',') + ';';
}
export function gridButtons(column) {
  var type = column.TIPO || column.type;
  if (type === 'btn2') return column.BTN2 || [];
  if (type === 'btn3') return column.BTN3 || [];
  if (type === 'btn4') return column.BTN4 || [];
  if (type === 'btn') return column.BTN ? [column.BTN] : [];
  return [];
}
export function gridCellKind(column) {
  var type = column.TIPO || column.type || 'string';
  if (/^btn(?:[234]|-(?:danger|primary|success|warning|info))?$/.test(type)) return 'buttons';
  if (type === 'status' || type === 'status2') return 'status';
  if (type === 'cor' || type === 'cor-grd') return 'color';
  if (['link', 'html', 'htmlcp', 'imput_number'].includes(type)) return type;
  return 'text';
}
