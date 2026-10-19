import template from './g-button-group.html';
import styles from './g-button-group.css';
export default EasyComponents.defineComponent('g-button-group', {
  props: { items: EasyComponents.array(() => []), value: { binding: '<', default: '' }, label: EasyComponents.text('Opções'), isDisabled: EasyComponents.boolean(false), onChange: EasyComponents.event() },
  methods: { choose: function (item) { if (!this.isDisabled && !item.disabled) this.$emit('onChange', item.value); }, keydown: function (event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(this.$element[0].querySelectorAll('button:not(:disabled)')); const index = buttons.indexOf(event.target);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    if (buttons[next]) { event.preventDefault(); buttons[next].focus(); }
  } }, template, styles, scoped: true
});
