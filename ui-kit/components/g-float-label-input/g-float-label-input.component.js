import template from './g-float-label-input.html';
import styles from './g-float-label-input.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-float-label-input', {
  props: { model: EasyComponents.text('', { binding: '<' }), label: EasyComponents.text(''), type: EasyComponents.text('text'), erro: EasyComponents.text(''), hint: EasyComponents.text(''), isDisabled: EasyComponents.boolean(false), readonly: EasyComponents.boolean(false), required: EasyComponents.boolean(false), autocomplete: EasyComponents.text('off'), onChange: EasyComponents.event(), onBlur: EasyComponents.event() },
  state: function () { return { uid: 'g-field-' + ++sequence }; },
  methods: { change: function (event) { this.$emit('onChange', event.target.value); }, blur: function (event) { this.$emit('onBlur', event.target.value); } }, template, styles, scoped: true
});
