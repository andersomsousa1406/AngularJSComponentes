import template from './g-switch.html';
import styles from './g-switch.css';
export default EasyComponents.defineComponent('g-switch', { props: { model: EasyComponents.boolean(false), label: EasyComponents.text(''), description: EasyComponents.text(''), isDisabled: EasyComponents.boolean(false), onChange: EasyComponents.event() }, methods: { change: function () { if (!this.isDisabled) this.$emit('onChange', !this.model); } }, template, styles, scoped: true });
