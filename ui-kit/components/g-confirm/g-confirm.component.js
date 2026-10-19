import template from './g-confirm.html';
import styles from './g-confirm.css';
export default EasyComponents.defineComponent('g-confirm', {
  props: { open: EasyComponents.boolean(false), title: EasyComponents.text('Confirmar ação'), message: EasyComponents.text('Deseja continuar?'), confirmText: EasyComponents.text('Confirmar'), cancelText: EasyComponents.text('Cancelar'), color: EasyComponents.text('primary'), busy: EasyComponents.boolean(false), onConfirm: EasyComponents.event(), onCancel: EasyComponents.event() }, template, styles, scoped: true
});
