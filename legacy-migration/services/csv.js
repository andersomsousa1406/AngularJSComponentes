export function parseRecords(source, separator) {
  if (!separator || typeof separator !== 'string') throw new Error('Separador invalido.');
  source = String(source).replace(/^\uFEFF/, '');
  var records = [], record = [], value = '', quoted = false;
  for (var index = 0; index < source.length; index++) {
    var character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') { value += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && source.slice(index, index + separator.length) === separator) {
      record.push(value.trim()); value = ''; index += separator.length - 1;
    } else if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && source[index + 1] === '\n') index++;
      record.push(value.trim());
      if (record.some(function (field) { return field !== ''; })) records.push(record);
      record = []; value = '';
    } else value += character;
  }
  if (quoted) throw new Error('O arquivo possui aspas sem fechamento.');
  record.push(value.trim());
  if (record.some(function (field) { return field !== ''; })) records.push(record);
  return records;
}
export function parseCsv(source, separator, hasHeader) {
  var records = parseRecords(source, separator);
  if (!records.length) return { headers: [], rows: [], records: [] };
  var headers = hasHeader ? records.shift() : records[0].map(function (_, index) { return 'COLUNA_' + (index + 1); });
  if (new Set(headers).size !== headers.length || headers.some(function (header) { return !header || header === '__id'; })) throw new Error('O cabecalho possui nomes vazios, duplicados ou reservados.');
  var rows = records.map(function (values, index) {
    if (values.length !== headers.length) throw new Error('Quantidade de campos divergente no registro ' + (index + (hasHeader ? 2 : 1)) + '.');
    return Object.fromEntries([['__id', index + 1]].concat(headers.map(function (header, field) { return [header, values[field]]; })));
  });
  return { headers: headers, rows: rows, records: records };
}
export function mapImportRows(rows, fields, mapping) {
  var missing = fields.filter(function (field) { return (field.required || field.OBRIGATORIO) && !mapping[field.key || field.CAMPO]; });
  if (missing.length) throw new Error('Os campos "' + missing.map(function (field) { return field.label || field.DESCRICAO || field.key || field.CAMPO; }).join(', ') + '" são obrigatórios.');
  return rows.map(function (row) {
    return Object.fromEntries([['__id', row.__id]].concat(fields.filter(function (field) { return mapping[field.key || field.CAMPO]; })
      .map(function (field) { var key = field.key || field.CAMPO; return [key, row[mapping[key]]]; })));
  });
}
