import template from './g-toast.html';
import styles from './g-toast.css';
export default EasyComponents.defineComponent('g-toast', {
  inject: { toast: 'GToast' }, props: { onDismiss: EasyComponents.event() },
  methods: { dismiss: function (id) { this.toast.dismiss(id); this.$emit('onDismiss', id); } }, template, styles, scoped: true
});
