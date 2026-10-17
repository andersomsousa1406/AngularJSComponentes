import template from './gc-lookup.html';
import styles from './gc-lookup.css';

function text(value) {
  return String(value === undefined || value === null ? '' : value).toLowerCase();
}

export default EasyComponents.defineComponent('gc-lookup', {
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
    onSearch: EasyComponents.event(),
    onSelect: EasyComponents.event(),
    onClear: EasyComponents.event()
  },

  state: function () { return { query: '', open: false }; },

  computed: {
    visibleItems: function () {
      var query = text(this.query);
      var columns = this.columns;
      return this.items.filter(function (item) {
        return !query || columns.some(function (column) { return text(item[column.key]).indexOf(query) !== -1; });
      }).slice(0, this.maxResults);
    },
    selectedLabel: function () {
      if (!this.value) return '';
      var first = this.columns[0];
      return first ? this.value[first.key] : this.value[this.trackBy];
    }
  },

  methods: {
    search: function () {
      var ready = this.query.length >= this.minChars;
      this.$setState({ open: ready });
      if (ready) this.$emit('onSearch', this.query);
    },
    select: function (item) {
      this.$setState({ query: '', open: false });
      this.$emit('onSelect', item);
    },
    clear: function () {
      this.$setState({ query: '', open: false });
      this.$emit('onClear', null);
    },
    identity: function (item) { return item[this.trackBy]; }
  },

  template: template,
  styles: styles,
  scoped: true
});
