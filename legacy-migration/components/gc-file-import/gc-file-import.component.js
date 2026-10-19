import template from './gc-file-import.html';
import styles from './gc-file-import.css';
import { parseCsv, mapImportRows } from '../../services/csv.js';

export default EasyComponents.defineComponent('gc-file-import', {
  props: {
    title: EasyComponents.text('Importacao por arquivo'),
    separator: EasyComponents.text(';'),
    hasHeader: EasyComponents.boolean(true),
    accept: EasyComponents.text('.csv,text/csv'),
    maxPreview: EasyComponents.number(50),
    fields: EasyComponents.array(function () { return []; }),
    onReady: EasyComponents.event(),
    onParse: EasyComponents.event(),
    onImport: EasyComponents.event(),
    onError: EasyComponents.event()
  },

  state: function () { return { fileName: '', headers: [], rows: [], loading: false, error: '', mapping: {}, generation: 0 }; },

  computed: {
    columns: function () {
      if (this._headersSource !== this.headers) {
        this._headersSource = this.headers;
        this._columns = this.headers.map(function (header) { return { key: header, label: header }; });
      }
      return this._columns;
    },
    previewRows: function () {
      if (this._rowsSource !== this.rows || this._maxPreview !== this.maxPreview) {
        this._rowsSource = this.rows; this._maxPreview = this.maxPreview;
        this._previewRows = this.rows.slice(0, this.maxPreview);
      }
      return this._previewRows;
    }
  },

  methods: {
    parseText: function (source) {
      var result = parseCsv(source, this.separator, this.hasHeader);
      var mapping = {};
      this.fields.forEach(function (field) { var key = field.key || field.CAMPO; if (result.headers.indexOf(key) >= 0) mapping[key] = key; });
      this.$setState({ headers: result.headers, rows: result.rows, mapping: mapping, loading: false, error: '' });
      return result;
    },
    choose: function () { this.$element[0].querySelector('input[type=file]').click(); },
    read: function (file) {
      var that = this;
      if (!file) return;
      this.$setState({ loading: true, error: '', fileName: file.name });
      if (this.reader && this.reader.readyState === 1) this.reader.abort();
      var generation = ++this.generation;
      var reader = this.reader = new FileReader();
      reader.onload = function () {
        if (generation !== that.generation) return;
        try {
          var result = that.parseText(String(reader.result || ''));
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
    clear: function () { ++this.generation; if (this.reader && this.reader.readyState === 1) this.reader.abort(); this.$setState({ fileName: '', headers: [], rows: [], error: '', mapping: {}, loading: false }); },
    importRows: function () {
      try {
        var rows = this.fields.length ? mapImportRows(this.rows, this.fields, this.mapping) : this.rows.slice();
        this.$emit('onImport', { headers: this.headers.slice(), rows: rows });
      } catch (error) { this.fail(error); }
    }
  },

  hooks: {
    onInit: function () { this.$emit('onReady', this); },
    postLink: function () {
      var that = this;
      this.fileInput = this.$element[0].querySelector('input[type=file]');
      this.fileChange = function (event) { that.read(event.target.files[0]); event.target.value = ''; };
      this.fileInput.addEventListener('change', this.fileChange);
    },
    onDestroy: function () { ++this.generation; if (this.reader && this.reader.readyState === 1) this.reader.abort(); if (this.fileInput) this.fileInput.removeEventListener('change', this.fileChange); }
  },

  template: template,
  styles: styles,
  scoped: true
});
