import template from './gc-data-grid.html';
import styles from './gc-data-grid.css';
import { createGridClient, normalizeColumns } from '../../services/grid-client.js';

function compare(left, right) {
  if (left === right) return 0;
  if (left === undefined || left === null) return -1;
  if (right === undefined || right === null) return 1;
  return left < right ? -1 : 1;
}

export default EasyComponents.defineComponent('gc-data-grid', {
  inject: { api: 'GcApi' },
  props: {
    rows: EasyComponents.array(function () { return []; }),
    columns: EasyComponents.array(function () { return []; }),
    config: EasyComponents.object(null),
    onReady: EasyComponents.event(),
    onExport: EasyComponents.event(),
    onError: EasyComponents.event(),
    trackBy: EasyComponents.text('ID'),
    pageSize: EasyComponents.number(20, function (value) { return value > 0; }),
    selectable: EasyComponents.boolean(false),
    multiSelect: EasyComponents.boolean(false),
    loading: EasyComponents.boolean(false),
    emptyText: EasyComponents.text('Nenhum registro encontrado.'),
    onSelect: EasyComponents.event(),
    onPageChange: EasyComponents.event(),
    onSort: EasyComponents.event()
  },

  state: function () {
    return { query: '', page: 1, sortKey: '', sortDirection: 'asc', selection: [], grid: null };
  },

  computed: {
    displayColumns: function () {
      var source = this.grid ? this.grid.COLUNAS : this.columns;
      var signature = JSON.stringify(source);
      if (this._columnsSource !== source || this._columnsSignature !== signature) {
        this._columnsSource = source; this._columnsSignature = signature;
        this._visibleColumns = normalizeColumns(source).filter(function (column) { return column.visible; });
      }
      return this._visibleColumns;
    },
    totals: function () { return this.grid ? this.grid.TotalTabela() : {}; },
    filteredRows: function () {
      if (this.grid) return this.grid.DADOS_RENDER;
      var query = this.query.toLowerCase();
      var columns = this.columns;
      var key = this.sortKey;
      var direction = this.sortDirection === 'asc' ? 1 : -1;
      return this.rows.filter(function (row) {
        return !query || columns.some(function (column) {
          return String(row[column.key] === undefined ? '' : row[column.key]).toLowerCase().indexOf(query) !== -1;
        });
      }).sort(function (left, right) { return key ? compare(left[key], right[key]) * direction : 0; });
    },
    pageCount: function () { return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize)); },
    visibleRows: function () {
      var start = (Math.min(this.page, this.pageCount) - 1) * this.pageSize;
      return this.filteredRows.slice(start, start + this.pageSize);
    }
  },

  methods: {
    search: function () { if (this.grid) { this.grid.filtro = this.query; this.grid.FiltrarTabela(); } this.$setState({ page: 1 }); },
    format: function (row, column) { return this.grid ? this.grid.format(row, column) : row[column.key]; },
    exportCsv: function () { if (this.grid) this.$emit('onExport', { name: (this.grid.titulo || 'tabela') + '.csv', type: 'text/csv', content: this.grid.exportCsv() }); },
    sort: function (column) {
      if (column.sortable === false) return;
      var direction = this.sortKey === column.key && this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.$setState({ sortKey: column.key, sortDirection: direction, page: 1 });
      if (this.grid) this.grid.OrderTabela(column.key, direction);
      this.$emit('onSort', { key: column.key, direction: direction });
    },
    go: function (page) {
      page = Math.max(1, Math.min(page, this.pageCount));
      this.$setState({ page: page });
      this.$emit('onPageChange', page);
    },
    select: function (row) {
      if (!this.selectable) return;
      var key = this.trackBy;
      var exists = this.grid ? this.selected(row) : this.selection.some(function (item) { return item[key] === row[key]; });
      var selection = this.multiSelect
        ? (exists ? this.selection.filter(function (item) { return item[key] !== row[key]; }) : this.selection.concat([row]))
        : [row];
      this.$setState({ selection: selection });
      if (this.grid) {
        this.grid.SELECTED = row;
        if (!this.multiSelect) this.grid.DesmarcarItens();
        this.grid.setChangeCheck(row, !exists);
      }
      this.$emit('onSelect', this.multiSelect ? selection : row);
    },
    selected: function (row) {
      if (this.grid) return !!row[this.grid.campo_model.substring(this.grid.campo_model.indexOf('.') + 1)];
      var key = this.trackBy;
      return this.selection.some(function (item) { return item[key] === row[key]; });
    },
    identity: function (row) { return row[this.trackBy]; }
  },

  hooks: {
    onInit: function () {
      if (!this.config) return;
      var vm = this;
      vm.grid = createGridClient(Object.assign({ DADOS: vm.rows, COLUNAS: vm.columns }, vm.config), {
        api: vm.api, notify: function () { if (vm.grid) vm.$setState({ grid: vm.grid }); }
      });
      vm.$emit('onReady', vm.grid);
    },
    onChanges: function (changes) {
      if (!this.grid) return;
      if (changes.config) { this.grid.setData(changes.config.currentValue || {}); this.grid.FiltrarTabela(); }
      if (changes.rows) this.grid.merge(changes.rows.currentValue || []);
      if (changes.columns) this.grid.COLUNAS = changes.columns.currentValue || [];
    },
    onDestroy: function () { if (this.grid) this.grid.destroy(); }
  },

  template: template,
  styles: styles,
  scoped: true
});
