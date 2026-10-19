import template from './gc-smart-input.html';
import styles from './gc-smart-input.css';

function normalize(value) {
  return String(value === undefined || value === null ? '' : value).toLowerCase();
}

export default EasyComponents.defineComponent('gc-smart-input', {
  inject: { api: 'GcApi' },
  props: {
    label: EasyComponents.text(''),
    items: EasyComponents.array(function () { return []; }),
    value: EasyComponents.object(null),
    displayKey: EasyComponents.text('DESCRICAO'),
    valueKey: EasyComponents.text('ID'),
    placeholder: EasyComponents.text('Digite para pesquisar'),
    required: EasyComponents.boolean(false),
    disabled: EasyComponents.boolean(false),
    maxResults: EasyComponents.number(20),
    endpoint: EasyComponents.text(''),
    filters: EasyComponents.object(function () { return {}; }),
    onReady: EasyComponents.event(),
    onError: EasyComponents.event(),
    onSelect: EasyComponents.event(),
    onClear: EasyComponents.event(),
    onSearch: EasyComponents.event()
  },

  state: function () {
    return { query: this.value ? this.value[this.displayKey] || '' : '', open: false, activeIndex: -1,
      DADOS: this.items, SELECTED: this.value || {}, BACKUP: {}, loading: false, generation: 0 };
  },

  computed: {
    filteredItems: function () {
      var query = normalize(this.query);
      var key = this.displayKey;
      return this.DADOS.filter(function (item) {
        return !query || normalize(item[key]).indexOf(query) !== -1;
      }).slice(0, this.maxResults);
    }
  },

  methods: {
    merge: function (data) { this.$setState({ DADOS: data, dados_consultados: true, total_dados: data.length }); },
    CheckDados: function () {
      var vm = this;
      if (!vm.endpoint || vm.disabled) return Promise.resolve(vm.DADOS);
      var generation = ++vm.generation;
      vm.$setState({ loading: true });
      return vm.api.post(vm.endpoint, { FILTRO: vm.filters, DADOS: vm.filters }).then(function (rows) {
        if (generation === vm.generation) vm.merge(rows); return rows;
      }).catch(function (error) { if (generation === vm.generation) vm.$emit('onError', error); throw error; })
        .finally(function () { if (generation === vm.generation) vm.$setState({ loading: false }); });
    },
    alterar: function () { this.BACKUP = angular.copy(this.SELECTED); },
    restore: function () { Object.assign(this.SELECTED, angular.copy(this.BACKUP)); this.$setState({ query: this.SELECTED[this.displayKey] || '', open: false }); },
    findInList: function () {
      var value = this.SELECTED[this.displayKey];
      var field = this.displayKey;
      var row = this.DADOS.find(function (item) { return normalize(item[field]).trim() && normalize(item[field]) === normalize(value); });
      if (row) this.SELECTED[field] = row[field];
      this.$setState({ query: this.SELECTED[field] || '' }); return this.SELECTED[field];
    },
    setSelected: function (item) { this.$setState({ SELECTED: item, query: item[this.displayKey] || '', open: false, activeIndex: -1 }); },
    setChoosen: function (item) { return this.select(item); },
    AbrirLista: function () { if (!this.disabled) this.$setState({ open: true }); },
    closeLista: function () { this.$setState({ open: false, activeIndex: -1 }); },
    apagar: function () { return this.clear(); },
    search: function () {
      if (this.disabled) return;
      this.$setState({ open: true, activeIndex: -1 });
      this.$emit('onSearch', this.query);
      if (this.endpoint) return this.CheckDados().catch(function () {});
    },
    select: function (item) {
      if (this.disabled) return;
      this.$setState({ SELECTED: item, query: item[this.displayKey], open: false, activeIndex: -1 });
      this.$emit('onSelect', item);
    },
    clear: function () {
      if (this.disabled) return;
      ++this.generation;
      this.$setState({ SELECTED: {}, query: '', open: false, activeIndex: -1, loading: false });
      this.$emit('onClear', null);
    },
    keydown: function (event) {
      if (event.key === 'Escape') return this.$setState({ open: false, activeIndex: -1 });
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        return this.$setState({ open: true, activeIndex: Math.min(this.activeIndex + 1, this.filteredItems.length - 1) });
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        return this.$setState({ activeIndex: Math.max(this.activeIndex - 1, 0) });
      }
      if (event.key === 'Enter' && this.activeIndex >= 0) {
        event.preventDefault();
        this.select(this.filteredItems[this.activeIndex]);
      }
    },
    itemId: function (item) { return item[this.valueKey]; }
  },

  hooks: {
    onInit: function () { this.$emit('onReady', this); },
    onChanges: function (changes) {
      if (changes.items) this.DADOS = changes.items.currentValue || [];
      if (changes.value) {
        var value = changes.value.currentValue || {};
        this.$setState({ SELECTED: value, query: value[this.displayKey] || '' });
      }
    },
    onDestroy: function () { ++this.generation; }
  },

  template: template,
  styles: styles,
  scoped: true
});
