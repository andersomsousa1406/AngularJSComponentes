import template from './gc-smart-input.html';
import styles from './gc-smart-input.css';

function normalize(value) {
  return String(value === undefined || value === null ? '' : value).toLowerCase();
}

export default EasyComponents.defineComponent('gc-smart-input', {
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
    onSelect: EasyComponents.event(),
    onClear: EasyComponents.event(),
    onSearch: EasyComponents.event()
  },

  state: function () {
    return { query: this.value ? this.value[this.displayKey] || '' : '', open: false, activeIndex: -1 };
  },

  computed: {
    filteredItems: function () {
      var query = normalize(this.query);
      var key = this.displayKey;
      return this.items.filter(function (item) {
        return !query || normalize(item[key]).indexOf(query) !== -1;
      }).slice(0, this.maxResults);
    }
  },

  methods: {
    search: function () {
      this.$setState({ open: true, activeIndex: -1 });
      this.$emit('onSearch', this.query);
    },
    select: function (item) {
      this.$setState({ query: item[this.displayKey], open: false, activeIndex: -1 });
      this.$emit('onSelect', item);
    },
    clear: function () {
      this.$setState({ query: '', open: false, activeIndex: -1 });
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
    onChanges: function (changes) {
      if (changes.value && changes.value.currentValue) {
        this.$setState({ query: changes.value.currentValue[this.displayKey] || '' });
      }
    }
  },

  template: template,
  styles: styles,
  scoped: true
});
