import template from './g-tabs.html';
import styles from './g-tabs.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-tabs', {
  transclude: true,
  props: { items: EasyComponents.array(() => []), active: { binding: '<', default: '' }, label: EasyComponents.text('Seções'), onChange: EasyComponents.event() },
  state: function () { return { uid: 'g-tabs-' + ++sequence }; },
  computed: { selectedIndex: function () { const index = this.items.findIndex(item => item.id === this.active && !item.disabled); return index >= 0 ? index : this.items.findIndex(item => !item.disabled); } },
  methods: {
    choose: function (item) { if (!item.disabled) this.$emit('onChange', item.id); },
    keydown: function (event) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const buttons = Array.from(this.$element[0].querySelectorAll('[role=tab]:not(:disabled)')), index = buttons.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      if (buttons[next]) { event.preventDefault(); buttons[next].focus(); buttons[next].click(); }
    }
  }, template, styles, scoped: true
});
