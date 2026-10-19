import template from './gc-lookup.html';
import styles from './gc-lookup.css';
import { createLookupClient } from '../../services/lookup-client.js';

function text(value) {
  return String(value === undefined || value === null ? '' : value).toLowerCase();
}

export default EasyComponents.defineComponent('gc-lookup', {
  inject: { api: 'GcApi' },
  props: {
    label: EasyComponents.text('Consulta'),
    items: EasyComponents.array(function () { return []; }),
    columns: EasyComponents.array(function () { return []; }),
    value: EasyComponents.object(null),
    trackBy: EasyComponents.text('ID'),
    placeholder: EasyComponents.text('Pesquisar...'),
    loading: EasyComponents.boolean(false),
    disabled: EasyComponents.boolean(false),
    required: EasyComponents.boolean(false),
    minChars: EasyComponents.number(0),
    maxResults: EasyComponents.number(50),
    endpoint: EasyComponents.text(''),
    config: EasyComponents.object(null),
    onReady: EasyComponents.event(),
    onError: EasyComponents.event(),
    onSearch: EasyComponents.event(),
    onSelect: EasyComponents.event(),
    onClear: EasyComponents.event()
  },

  state: function () { return { query: '', open: false, lookup: null, activeIndex: -1 }; },

  computed: {
    displayColumns: function () {
      if (this.columns.length || !this.lookup) return this.columns;
      var signature = JSON.stringify(this.lookup.option.campos_tabela);
      if (this._columnSignature !== signature) {
        this._columnSignature = signature;
        this._displayColumns = this.lookup.option.campos_tabela.map(function (column) { return { key: column[0], label: column[1] }; });
      }
      return this._displayColumns;
    },
    resultsStyle: function () { return this.lookup && this.lookup.option.tamanho_tabela ? { width: this.lookup.option.tamanho_tabela + 'px', right: 'auto' } : {}; },
    visibleItems: function () {
      var query = text(this.query);
      var columns = this.columns;
      if (this.lookup) return this.lookup.dados;
      return this.items.filter(function (item) {
        return !query || columns.some(function (column) { return text(item[column.key]).indexOf(query) !== -1; });
      }).slice(0, this.maxResults);
    },
    selectedLabel: function () {
      var value = this.value || (this.lookup && this.lookup.selected);
      if (!value) return '';
      if (this.lookup) return this.lookup.option.obj_ret.map(function (field) { return value[field]; }).filter(function (part) { return part != null; }).join(' - ');
      var first = this.displayColumns[0];
      return first ? value[first.key] : value[this.trackBy];
    }
  },

  methods: {
    setupLookup: function () {
      var vm = this;
      if (vm.lookup) vm.lookup.destroy();
      if (!vm.endpoint && !vm.config) { vm.lookup = null; return; }
      var config = Object.assign({}, vm.config);
      config.option = Object.assign({}, config.option);
      if (vm.endpoint) config.option.obj_consulta = vm.endpoint;
      var handler = config.onSelect;
      config.onSelect = function (row) {
        if (handler) handler(row);
        vm.$setState({ query: '', open: !!config.option.keepitopen }); vm.$emit('onSelect', row);
      };
      vm.lookup = createLookupClient(vm.api, config, {
        notify: function () { if (vm.lookup) vm.$setState({ lookup: vm.lookup, open: vm.lookup.tabela.visivel }); },
        onError: function (error) { vm.$emit('onError', error); },
        focus: function (target) {
          var element = vm.$element[0].querySelector(target === 'input' ? 'input' : 'tbody tr');
          if (element) element.focus();
        }
      });
      vm.$emit('onReady', vm.lookup);
    },
    keydown: function (event) {
      if (event.key === 'Escape') { this.$setState({ open: false, activeIndex: -1 }); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        var delta = event.key === 'ArrowDown' ? 1 : -1;
        this.$setState({ open: true, activeIndex: Math.max(0, Math.min(this.activeIndex + delta, this.visibleItems.length - 1)) });
      } else if (event.key === 'Enter' && this.activeIndex >= 0 && this.visibleItems[this.activeIndex]) {
        event.preventDefault(); this.select(this.visibleItems[this.activeIndex]);
      }
    },
    loadMore: function () { if (this.lookup) return this.lookup.onScrollEnd().catch(function () {}); },
    search: function () {
      var ready = this.query.length >= this.minChars;
      this.$setState({ open: ready });
      if (ready) this.$emit('onSearch', this.query);
      if (ready && this.lookup) { this.lookup.Input.value = this.query; return this.lookup.filtrar().catch(function () {}); }
    },
    select: function (item) {
      if (this.lookup) return this.lookup.selecionarItem(item);
      this.$setState({ query: '', open: false });
      this.$emit('onSelect', item);
    },
    clear: function () {
      if (this.lookup) this.lookup.clear();
      this.$setState({ query: '', open: false });
      this.$emit('onClear', null);
    },
    identity: function (item) { return item[this.trackBy]; }
  },

  hooks: {
    onInit: function () { this.setupLookup(); },
    onChanges: function (changes) {
      if (this.lookup && (changes.config || changes.endpoint)) this.setupLookup();
      if (this.lookup && changes.value && changes.value.currentValue) this.lookup.setSelected(changes.value.currentValue);
    },
    onDestroy: function () { if (this.lookup) this.lookup.destroy(); }
  },

  template: template,
  styles: styles,
  scoped: true
});
