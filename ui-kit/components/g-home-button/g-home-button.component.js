import template from './g-home-button.html';
import styles from './g-home-button.css';
export default EasyComponents.defineComponent('g-home-button', {
  props: { text: EasyComponents.text(''), group: EasyComponents.text('Geral'), icon: EasyComponents.text('folder'), color: EasyComponents.text('primary'), description: EasyComponents.text(''), isDisabled: EasyComponents.boolean(false), loading: EasyComponents.boolean(false), onClick: EasyComponents.event() },
  methods: { click: function (event) { if (!this.isDisabled && !this.loading) this.$emit('onClick', event); } }, template, styles, scoped: true
});
