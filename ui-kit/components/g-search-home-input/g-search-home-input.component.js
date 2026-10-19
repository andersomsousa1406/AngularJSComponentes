import template from './g-search-home-input.html';
import styles from './g-search-home-input.css';
let sequence = 0;
function normalize(value) { return String(value == null ? '' : value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export default EasyComponents.defineComponent('g-search-home-input', {
  inject: { scope: '$scope', document: '$document' },
  props: { model: EasyComponents.text('', { binding: '<' }), label: EasyComponents.text('Pesquisar'), placeholder: EasyComponents.text('Buscar por código ou descrição...'), data: EasyComponents.array(() => []), fields: EasyComponents.array(() => ['CONTROLE', 'GRUPO', 'DESCRICAO']), maxResults: EasyComponents.number(8), isDisabled: EasyComponents.boolean(false), onChange: EasyComponents.event(), onSelect: EasyComponents.event() },
  state: function () { return { uid: 'g-search-' + ++sequence, open: false, active: -1 }; },
  computed: { matches: function () { const tokens = normalize(this.model).trim().split(/\s+/); const fields = this.fields; return this.data.filter(row => tokens.every(token => normalize(fields.map(field => row[field]).join(' ')).includes(token))).slice(0, Math.max(1, this.maxResults)); } },
  methods: {
    change: function (event) { this.active = -1; this.open = true; this.$emit('onChange', event.target.value); },
    choose: function (row) { if (this.isDisabled) return; this.open = false; this.active = -1; this.$emit('onSelect', row); },
    keydown: function (event) {
      if (event.key === 'Escape') { this.open = false; this.active = -1; }
      else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); this.open = true; this.active = Math.max(0, Math.min(this.matches.length - 1, this.active + (event.key === 'ArrowDown' ? 1 : -1))); }
      else if (event.key === 'Enter' && this.open && this.matches[this.active]) { event.preventDefault(); this.choose(this.matches[this.active]); }
    }
  },
  hooks: { postLink: function () { const vm = this; vm._outside = event => { if (vm.open && !vm.$element[0].contains(event.target)) vm.scope.$evalAsync(() => { vm.open = false; }); }; vm.document[0].addEventListener('click', vm._outside); }, onDestroy: function () { this.document[0].removeEventListener('click', this._outside); } },
  template, styles, scoped: true
});
