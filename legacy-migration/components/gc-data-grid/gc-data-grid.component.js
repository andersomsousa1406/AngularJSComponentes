import template from './gc-data-grid.html';
import styles from './gc-data-grid.css';

function compare(left, right) {
  if (left === right) return 0;
  if (left === undefined || left === null) return -1;
  if (right === undefined || right === null) return 1;
  return left < right ? -1 : 1;
}

export default EasyComponents.defineComponent('gc-data-grid', {
  props: {
    rows: EasyComponents.array(function () { return []; }),
    columns: EasyComponents.required(EasyComponents.array()),
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
    return { query: '', page: 1, sortKey: '', sortDirection: 'asc', selection: [] };
  },

  computed: {
    filteredRows: function () {
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
    search: function () { this.$setState({ page: 1 }); },
    sort: function (column) {
      if (column.sortable === false) return;
      var direction = this.sortKey === column.key && this.sortDirection === 'asc' ? 'desc' : 'asc';
      this.$setState({ sortKey: column.key, sortDirection: direction, page: 1 });
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
      var exists = this.selection.some(function (item) { return item[key] === row[key]; });
      var selection = this.multiSelect
        ? (exists ? this.selection.filter(function (item) { return item[key] !== row[key]; }) : this.selection.concat([row]))
        : [row];
      this.$setState({ selection: selection });
      this.$emit('onSelect', this.multiSelect ? selection : row);
    },
    selected: function (row) {
      var key = this.trackBy;
      return this.selection.some(function (item) { return item[key] === row[key]; });
    },
    identity: function (row) { return row[this.trackBy]; }
  },

  template: template,
  styles: styles,
  scoped: true
});
