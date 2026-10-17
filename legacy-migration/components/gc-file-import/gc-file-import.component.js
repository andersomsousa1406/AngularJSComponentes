import template from './gc-file-import.html';
import styles from './gc-file-import.css';

function parseLine(line, separator) {
  var values = [];
  var value = '';
  var quoted = false;
  for (var index = 0; index < line.length; index += 1) {
    var character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === separator && !quoted) { values.push(value.trim()); value = ''; }
    else value += character;
  }
  values.push(value.trim());
  return values;
}

function parseCsv(source, separator, hasHeader) {
  var lines = source.replace(/^\uFEFF/, '').split(/\r?\n/).filter(function (line) { return line.trim(); });
  if (!lines.length) return { headers: [], rows: [] };
  var first = parseLine(lines[0], separator);
  var headers = hasHeader ? first : first.map(function (_, index) { return 'COLUNA_' + (index + 1); });
  var start = hasHeader ? 1 : 0;
  var rows = lines.slice(start).map(function (line, rowIndex) {
    var values = parseLine(line, separator);
    var row = { __id: rowIndex + 1 };
    headers.forEach(function (header, index) { row[header] = values[index] || ''; });
    return row;
  });
  return { headers: headers, rows: rows };
}

export default EasyComponents.defineComponent('gc-file-import', {
  props: {
    title: EasyComponents.text('Importacao por arquivo'),
    separator: EasyComponents.text(';'),
    hasHeader: EasyComponents.boolean(true),
    accept: EasyComponents.text('.csv,text/csv'),
    maxPreview: EasyComponents.number(50),
    onParse: EasyComponents.event(),
    onImport: EasyComponents.event(),
    onError: EasyComponents.event()
  },

  state: function () { return { fileName: '', headers: [], rows: [], loading: false, error: '' }; },

  computed: {
    columns: function () {
      return this.headers.map(function (header) { return { key: header, label: header }; });
    },
    previewRows: function () { return this.rows.slice(0, this.maxPreview); }
  },

  methods: {
    choose: function () { this.$element[0].querySelector('input[type=file]').click(); },
    read: function (file) {
      var that = this;
      if (!file) return;
      this.$setState({ loading: true, error: '', fileName: file.name });
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var result = parseCsv(String(reader.result || ''), that.separator, that.hasHeader);
          that.$setState({ headers: result.headers, rows: result.rows, loading: false });
          that.$emit('onParse', { file: file, headers: result.headers, rows: result.rows });
        } catch (error) {
          that.fail(error);
        }
      };
      reader.onerror = function () { that.fail(reader.error || new Error('Nao foi possivel ler o arquivo.')); };
      reader.readAsText(file);
    },
    fail: function (error) {
      this.$setState({ loading: false, error: error.message || String(error) });
      this.$emit('onError', error);
    },
    clear: function () { this.$setState({ fileName: '', headers: [], rows: [], error: '' }); },
    importRows: function () { this.$emit('onImport', { headers: this.headers.slice(), rows: this.rows.slice() }); }
  },

  hooks: {
    postLink: function () {
      var that = this;
      this.fileInput = this.$element[0].querySelector('input[type=file]');
      this.fileChange = function (event) { that.read(event.target.files[0]); event.target.value = ''; };
      this.fileInput.addEventListener('change', this.fileChange);
    },
    onDestroy: function () { if (this.fileInput) this.fileInput.removeEventListener('change', this.fileChange); }
  },

  template: template,
  styles: styles,
  scoped: true
});
