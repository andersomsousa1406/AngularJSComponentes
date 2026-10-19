import template from './g-number-input.html';
import styles from '../shared/field.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-number-input', {
  props: { model: EasyComponents.number(null), label: EasyComponents.text('Valor'), min: EasyComponents.number(null), max: EasyComponents.number(null), step: EasyComponents.text('any'), required: EasyComponents.boolean(false), isDisabled: EasyComponents.boolean(false), readonly: EasyComponents.boolean(false), erro: EasyComponents.text(''), hint: EasyComponents.text(''), onChange: EasyComponents.event(), onValidity: EasyComponents.event() },
  state: function () { return { uid: 'g-number-' + ++sequence, validation: '' }; },
  methods: { validate: function (event, emitValue) {
    if (this.isDisabled || this.readonly) return;
    const input = event.target, value = Number.isNaN(input.valueAsNumber) ? null : input.valueAsNumber;
    this.validation = input.validity.badInput ? 'Informe um número válido.' : input.validity.valueMissing ? 'Preencha este campo.' : input.validity.rangeUnderflow ? 'Valor mínimo: ' + this.min : input.validity.rangeOverflow ? 'Valor máximo: ' + this.max : input.validity.stepMismatch ? 'Use um incremento de ' + this.step + '.' : '';
    if (emitValue && !input.validity.badInput) this.$emit('onChange', value);
    this.$emit('onValidity', { valid: input.validity.valid, value, error: this.validation });
  } }, template, styles, scoped: true
});
