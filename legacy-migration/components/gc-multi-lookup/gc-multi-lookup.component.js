import template from './gc-multi-lookup.html';
import styles from './gc-multi-lookup.css';

function includes(items, candidate, key) {
  return items.some(function (item) { return item[key] === candidate[key]; });
}

export default EasyComponents.defineComponent('gc-multi-lookup', {
  props: {
    title: EasyComponents.text('Selecao multipla'),
    items: EasyComponents.array(function () { return []; }),
    selected: EasyComponents.array(function () { return []; }),
    columns: EasyComponents.array(function () { return []; }),
    trackBy: EasyComponents.text('ID'),
    disabled: EasyComponents.boolean(false),
    onReady: EasyComponents.event(),
    onChange: EasyComponents.event(),
    onConfirm: EasyComponents.event()
  },

  state: function () { return { query: '', draft: this.selected.slice() }; },

  computed: {
    available: function () {
      var query = this.query.toLowerCase();
      var columns = this.columns;
      var selected = this.draft;
      var key = this.trackBy;
      return this.items.filter(function (item) {
        if (includes(selected, item, key)) return false;
        return !query || columns.some(function (column) {
          return String(item[column.key] || '').toLowerCase().indexOf(query) !== -1;
        });
      });
    }
  },

  methods: {
    add: function (item) {
      if (this.disabled || includes(this.draft, item, this.trackBy)) return;
      var draft = this.draft.concat([item]);
      this.$setState({ draft: draft });
      this.$emit('onChange', draft);
    },
    remove: function (item) {
      if (this.disabled) return;
      var key = this.trackBy;
      var draft = this.draft.filter(function (current) { return current[key] !== item[key]; });
      this.$setState({ draft: draft });
      this.$emit('onChange', draft);
    },
    addAll: function () {
      if (this.disabled) return;
      var draft = this.draft.concat(this.available);
      this.$setState({ draft: draft });
      this.$emit('onChange', draft);
    },
    clear: function () {
      if (this.disabled) return;
      this.$setState({ draft: [] });
      this.$emit('onChange', []);
    },
    getItensSelecionado: function () { return this.draft.slice(); },
    limpar: function () { return this.clear(); },
    incluirVarios: function (items) { var vm = this; items.forEach(function (item) { vm.add(item); }); },
    confirm: function () { if (!this.disabled) this.$emit('onConfirm', this.draft.slice()); },
    identity: function (item) { return item[this.trackBy]; }
  },

  hooks: {
    onInit: function () { this.$emit('onReady', this); },
    onChanges: function (changes) {
      if (changes.selected) this.$setState({ draft: (changes.selected.currentValue || []).slice() });
    }
  },

  template: template,
  styles: styles,
  scoped: true
});
