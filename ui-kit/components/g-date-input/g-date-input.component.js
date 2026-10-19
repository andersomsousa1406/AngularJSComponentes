import template from './g-date-input.html';
import styles from '../shared/field.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-date-input', {
  props: { model: EasyComponents.text('', { binding: '<' }), label: EasyComponents.text('Data'), min: EasyComponents.text(''), max: EasyComponents.text(''), required: EasyComponents.boolean(false), isDisabled: EasyComponents.boolean(false), readonly: EasyComponents.boolean(false), erro: EasyComponents.text(''), hint: EasyComponents.text(''), onChange: EasyComponents.event(), onValidity: EasyComponents.event() },
  state: function () { return { uid: 'g-date-' + ++sequence, validation: '' }; },
  methods: { change: function (event) {
    if (this.isDisabled || this.readonly) return;
    const input = event.target;
    this.validation = input.validity.valueMissing ? 'Selecione uma data.' : input.validity.rangeUnderflow ? 'A data mínima é ' + this.min + '.' : input.validity.rangeOverflow ? 'A data máxima é ' + this.max + '.' : input.validity.badInput ? 'Informe uma data válida.' : '';
    this.$emit('onChange', input.value); this.$emit('onValidity', { valid: input.validity.valid, value: input.value, error: this.validation });
  } }, template, styles, scoped: true
});
