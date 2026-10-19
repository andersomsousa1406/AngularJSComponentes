import template from './g-select.html';
import styles from './g-select.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-select', {
  props: { model: { binding: '<', default: '' }, options: EasyComponents.array(() => []), label: EasyComponents.text('Selecionar'), placeholder: EasyComponents.text('Selecione uma opção'), valueKey: EasyComponents.text('value'), labelKey: EasyComponents.text('label'), isDisabled: EasyComponents.boolean(false), required: EasyComponents.boolean(false), erro: EasyComponents.text(''), onChange: EasyComponents.event() },
  state: function () { return { uid: 'g-select-' + ++sequence, draft: this.model }; },
  methods: { change: function () { this.$emit('onChange', this.draft); } },
  hooks: { onChanges: function (changes) { if (changes.model) this.draft = changes.model.currentValue; } },
  template, styles, scoped: true
});
