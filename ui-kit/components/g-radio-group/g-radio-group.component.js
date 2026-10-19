import template from './g-radio-group.html';
import styles from './g-radio-group.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-radio-group', {
  props: { model: { binding: '<', default: null }, options: EasyComponents.array(() => []), label: EasyComponents.text('Opções'), isDisabled: EasyComponents.boolean(false), required: EasyComponents.boolean(false), inline: EasyComponents.boolean(false), onChange: EasyComponents.event() },
  state: function () { return { uid: 'g-radio-' + ++sequence }; },
  methods: { choose: function (option) { if (!this.isDisabled && !option.disabled) this.$emit('onChange', option.value); } }, template, styles, scoped: true
});
