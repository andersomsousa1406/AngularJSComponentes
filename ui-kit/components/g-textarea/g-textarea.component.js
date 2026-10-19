import template from './g-textarea.html';
import styles from '../shared/field.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-textarea', {
  props: { model: EasyComponents.text('', { binding: '<' }), label: EasyComponents.text('Observações'), placeholder: EasyComponents.text(''), rows: EasyComponents.number(4), maxLength: EasyComponents.number(0), required: EasyComponents.boolean(false), readonly: EasyComponents.boolean(false), isDisabled: EasyComponents.boolean(false), erro: EasyComponents.text(''), hint: EasyComponents.text(''), onChange: EasyComponents.event(), onBlur: EasyComponents.event() },
  state: function () { return { uid: 'g-textarea-' + ++sequence }; },
  methods: { change: function (event) { if (!this.isDisabled && !this.readonly) this.$emit('onChange', event.target.value); } }, template, styles, scoped: true
});
