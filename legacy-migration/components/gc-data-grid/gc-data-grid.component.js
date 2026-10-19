import template from './gc-data-grid.html';
import styles from './gc-data-grid.css';
import { createGridClient, normalizeColumns, gridMenu, gridCellStyle } from '../../services/grid-client.js';
import { gridButtons, gridCellKind, gridLink, gridGradient } from '../../services/grid-cell-contract.js';

function compare(left, right) {
  if (left === right) return 0;
  if (left === undefined || left === null) return -1;
  if (right === undefined || right === null) return 1;
  return left < right ? -1 : 1;
}

export default EasyComponents.defineComponent('gc-data-grid', {
  inject: { api: 'GcApi', scope: '$scope', sce: '$sce', timeout: '$timeout' },
  props: {
    rows: EasyComponents.array(function () { return []; }),
    columns: EasyComponents.array(function () { return []; }),
    config: EasyComponents.object(null),
    onReady: EasyComponents.event(),
    onExport: EasyComponents.event(),
    onError: EasyComponents.event(),
    onColumnsChange: EasyComponents.event(),
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
    return { query: '', page: 1, sortKey: '', sortDirection: 'asc', selection: [], grid: null, menuOpen: false, rowMenu: null, cellPopover: null, columnVisibility: {} };
  },

  computed: {
    allColumns: function () {
      var source = this.grid ? this.grid.COLUNAS : this.columns;
      var signature = JSON.stringify(source);
      if (this._columnsSource !== source || this._columnsSignature !== signature) {
        this._columnsSource = source; this._columnsSignature = signature;
        this._normalizedColumns = normalizeColumns(source);
      }
      return this._normalizedColumns;
    },
    displayColumns: function () { var vm = this; return vm.allColumns.filter(function (column) { return vm.columnVisible(column); }); },
    showCheckboxes: function () { return this.multiSelect || !!(this.grid && this.grid.input_visible); },
    columnCount: function () { return this.displayColumns.length + (this.showCheckboxes ? 1 : 0) + (this.grid && this.grid.status_visible ? 1 : 0); },
    selectedRows: function () { var vm = this; return (vm.grid ? vm.grid.DADOS : vm.rows).filter(function (row) { return vm.selected(row); }); },
    allVisibleSelected: function () { var vm = this; return vm.filteredRows.length > 0 && vm.filteredRows.every(function (row) { return vm.selected(row); }); },
    viewportStyle: function () { return this.grid ? { height: this.grid.HEIGHT, minHeight: this.grid.MIN_HEIGHT, maxHeight: this.grid.MAX_HEIGHT || 'none', width: this.grid.WIDTH } : {}; },
    isLoading: function () { return this.loading || !!(this.grid && this.grid.loading); },
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
      if (this.grid && this.grid.infinite_scroll) return this.filteredRows;
      var start = (Math.min(this.page, this.pageCount) - 1) * this.pageSize;
      return this.filteredRows.slice(start, start + this.pageSize);
    }
  },

  methods: {
    search: function () { if (this.grid) { this.grid.filtro = this.query; this.grid.FiltrarTabela(); } this.$setState({ page: 1 }); },
    format: function (row, column) { return this.grid ? this.grid.formatCell(row, column) : row[column.key]; },
    cellKind: gridCellKind,
    buttons: function (column) {
      if (!/^btn-/.test(column.type)) return gridButtons(column);
      if (!this._legacyButtons) this._legacyButtons = new Map();
      if (!this._legacyButtons.has(column.id)) {
        var vm = this, icons = { 'btn-danger': 'trash', 'btn-primary': 'edit', 'btn-success': 'ok', 'btn-warning': 'print', 'btn-info': 'ok' };
        this._legacyButtons.set(column.id, [{ type: column.type, label: column.CAMPO, icone: 'glyphicon glyphicon-' + icons[column.type],
          disabled: function () { return !!vm.model().desabilitado; }, funcao: function (event, row) {
            var model = vm.model(); if (model.funcao_botao) { if (model.parametro === true) model.funcao_botao(row); else model.funcao_botao(); }
          } }]);
      }
      return this._legacyButtons.get(column.id);
    },
    actionValue: function (action, name, row, fallback) { return typeof action[name] === 'function' ? action[name](row) : action[name] === undefined ? fallback : action[name]; },
    model: function () { return this.grid && (typeof this.grid.model_selected === 'object' ? this.grid.model_selected : this.grid.model_tabela) || {}; },
    rowSelected: function (row) { return this.grid ? this.grid.marcar_linhas ? this.selected(row) : this.model().SELECTED === row : this.selected(row); },
    focusRow: function (row, event) {
      if (!this.grid) return;
      this.grid.SELECTED = row; this.model().SELECTED = row; this.grid.VER = true;
      if (this.grid.event_focus && this.grid.event_focus.function) this.grid.event_focus.function(row, event);
    },
    viewRow: function (row, event) {
      if (!this.grid || this.grid.marcar_linhas || this.grid.VER === false) return;
      this.focusRow(row, event);
      var model = this.model(); if (model.visualizar) model.visualizar();
    },
    rowKeydown: function (event, row) {
      // A cell control owns its own keyboard events.
      if (event.target !== event.currentTarget) return;
      if (!this.grid) { if (event.key === 'Enter') this.select(row); return; }
      if (event.key === 'Enter' && !this.grid.desabilitar_atalho_enter) this.viewRow(row, event);
      else if (event.key === ' ' && this.grid.input_visible && !this.grid.desabilitar_atalho_space) {
        event.preventDefault();
        var veto = this.grid.validar_space_function;
        if ((!veto || !veto.funcao || veto.funcao(row) === false) && !this.checkboxDisabled(row)) {
          this.grid.setRowChecked(row, !this.selected(row), false);
          this.$emit('onSelect', this.selectedRows);
        }
        if (this.grid.space_function) this.grid.space_function(row);
      }
    },
    checkboxDisabled: function (row) {
      if (!this.grid) return false;
      var disabled = this.grid.input_disabled;
      return disabled === true || !!(disabled && disabled.funcao && disabled.funcao(row)) || !this.grid.validarMarcarItem(row);
    },
    cellHtml: function (column, row) {
      var html = column.HTML && column.HTML.funcao ? String(column.HTML.funcao(row) || '') : '';
      if (!this._htmlCache) this._htmlCache = new Map();
      if (!this._htmlCache.has(html)) { if (this._htmlCache.size > 500) this._htmlCache.clear(); this._htmlCache.set(html, this.sce.trustAsHtml(html)); }
      return this._htmlCache.get(html);
    },
    cellLink: function (column, row) { return gridLink(column.LINK, column.LINK_PARAM, row); },
    linkSelect: function (event, row) { event.stopPropagation(); this.focusRow(row, event); },
    colorStyle: function (column, row) { return column.type === 'cor-grd' ? gridGradient(row[column.key]) : 'background-color:' + row[column.key] + ';'; },
    editBlur: function (event, column, row) { if (column.EVENT_BLUR && column.EVENT_BLUR.funcao) column.EVENT_BLUR.funcao(row, event); },
    exportCsv: function () { if (this.grid) this.$emit('onExport', { name: (this.grid.titulo || 'tabela') + '.csv', type: 'text/csv', content: this.grid.exportCsv() }); },
    columnVisible: function (column) { return this.columnVisibility[column.id] === undefined ? column.visible : this.columnVisibility[column.id]; },
    toggleColumn: function (column) {
      var visible = !this.columnVisible(column);
      if (this.grid) this.grid.setColumnVisible(column.key, visible, column.id);
      else { var visibility = Object.assign({}, this.columnVisibility); visibility[column.id] = visible; this.$setState({ columnVisibility: visibility }); }
      this.$emit('onColumnsChange', this.displayColumns);
    },
    cellStyle: function (column, header, row) { return gridCellStyle(column, row, this.grid, header); },
    statusStyle: function (row) { return gridCellStyle({ CAMPO: 'STATUS', STYLE_OPT: this.grid.status_style }, row, null, false); },
    actionFlag: function (action, name, row, fallback) { return typeof action[name] === 'function' ? action[name](row) : action[name] === undefined ? fallback : action[name]; },
    menuItems: function (button) {
      // Keep item identities stable across Angular digests; visibility callbacks still run per row.
      var signature = JSON.stringify(button.menu_drop);
      if (!button._nativeMenu || button._nativeMenuSignature !== signature) {
        button._nativeMenu = gridMenu(button); button._nativeMenuSignature = signature;
      }
      return button._nativeMenu;
    },
    activateAction: function (event, action, row) {
      event.stopPropagation();
      if (this.actionFlag(action, 'disabled', row, false) || this.actionFlag(action, 'readonly', row, false)) return;
      if (action.dropdown) { this.grid.SELECTED = row; this.model().SELECTED = row; }
      if (action.funcao) action.funcao(event, row);
      var bounds = event.currentTarget.getBoundingClientRect();
      this.rowMenu = action.dropdown ? (this.rowMenu && this.rowMenu.row === row && this.rowMenu.button === action ? null : { row: row, button: action,
        style: { left: Math.min(bounds.left, window.innerWidth - 330) + 'px', top: Math.min(bounds.bottom, window.innerHeight - 180) + 'px' } }) : null;
    },
    closeMenus: function () { this.menuOpen = false; this.rowMenu = null; this.cellPopover = null; },
    showPopover: function (event, column, row) {
      event.stopPropagation();
      if (this.cellPopover && this.cellPopover.row === row && this.cellPopover.column === column) { this.cellPopover = null; return; }
      var bounds = event.currentTarget.getBoundingClientRect();
      this.cellPopover = { row: row, column: column, text: column.POPOVER(row),
        style: { left: Math.max(5, Math.min(bounds.left, window.innerWidth - 300)) + 'px', top: Math.max(5, bounds.top - 70) + 'px' } };
    },
    totalLabel: function (column) {
      var value = this.totals[column.key];
      if (value === undefined) return '';
      if (column.TOTAL_FORMAT === 'string') return value;
      return (column.PREFIXOT || '') + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: column.DECIMAL || 0, maximumFractionDigits: column.DECIMAL || 0 }) + (column.SUFIXOT || '');
    },
    filterStatus: function () { if (!this.grid) return; this.grid.FILTRO = Object.assign({}, this.grid.FILTRO, { STATUS: this.grid.STATUS }); this.grid.FiltrarTabela(); this.$setState({ page: 1 }); },
    clearFilter: function () { this.query = ''; this.search(); },
    toggleCheck: function (row) {
      if (this.checkboxDisabled(row)) return;
      if (this.grid) this.grid.setRowChecked(row, !this.selected(row));
      else { var vm = this; var selected = this.selected(row); this.$setState({ selection: selected ? this.selection.filter(function (item) { return item[vm.trackBy] !== row[vm.trackBy]; }) : this.selection.concat([row]) }); }
      this.$emit('onSelect', this.selectedRows);
    },
    markAll: function () {
      if (this.grid) { if (this.allVisibleSelected) this.grid.DesmarcarItens(); else this.grid.MarcarItens(); }
      else this.$setState({ selection: this.allVisibleSelected ? [] : this.filteredRows.slice() });
      this.$emit('onSelect', this.selectedRows);
    },
    loadMore: function () { var vm = this; return this.grid.NextPage().catch(function (error) { vm.$emit('onError', error); }); },
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
      if (this.grid) {
        if (this.grid.marcar_linhas) { this.toggleCheck(row); if (this.grid.onMarcarClick) this.grid.onMarcarClick(row); }
        return; // Focus selects; viewing and marking are independent in TabelaJS.
      }
      if (!this.selectable) return;
      if (this.showCheckboxes) return this.toggleCheck(row);
      var key = this.trackBy;
      var exists = this.grid ? this.selected(row) : this.selection.some(function (item) { return item[key] === row[key]; });
      var selection = this.multiSelect
        ? (exists ? this.selection.filter(function (item) { return item[key] !== row[key]; }) : this.selection.concat([row]))
        : [row];
      this.$setState({ selection: selection });
      if (this.grid) {
        this.grid.SELECTED = row;
        if (!this.multiSelect) this.grid.DesmarcarItens();
        this.grid.setRowChecked(row, !exists);
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
    postLink: function () {
      var vm = this, viewport = vm.$element[0].querySelector('.gc-data-grid__viewport');
      vm._viewport = viewport;
      vm._onScroll = function () {
        vm.rowMenu = null; vm.cellPopover = null;
        if (vm.grid && vm.grid.infinite_scroll && !vm.grid.loading && !vm.grid.infinite_end &&
            viewport.scrollHeight > viewport.clientHeight && viewport.scrollTop > 0 && viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 20) {
          vm.scope.$evalAsync(function () { vm.loadMore(); });
        }
      };
      viewport.addEventListener('scroll', vm._onScroll);
    },
    onInit: function () {
      if (!this.config) return;
      var vm = this;
      vm.grid = createGridClient(Object.assign({ DADOS: vm.rows, COLUNAS: vm.columns }, vm.config), {
        api: vm.api, schedule: vm.timeout, cancel: vm.timeout.cancel, notify: function () { if (vm.grid) vm.$setState({ grid: vm.grid }); }
      });
      vm.$emit('onReady', vm.grid);
    },
    onChanges: function (changes) {
      if (!this.grid) return;
      if (changes.config) { this.grid.setData(changes.config.currentValue || {}); this.grid.FiltrarTabela(); }
      if (changes.rows) this.grid.merge(changes.rows.currentValue || []);
      if (changes.columns) this.grid.COLUNAS = changes.columns.currentValue || [];
    },
    onDestroy: function () { if (this._viewport) this._viewport.removeEventListener('scroll', this._onScroll); if (this.grid) this.grid.destroy(); }
  },

  template: template,
  styles: styles,
  scoped: true
});
