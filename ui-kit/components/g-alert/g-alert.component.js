import template from './g-alert.html';
import styles from './g-alert.css';
export default EasyComponents.defineComponent('g-alert', { transclude: true, props: { visible: EasyComponents.boolean(true), title: EasyComponents.text(''), message: EasyComponents.text(''), color: EasyComponents.text('info'), dismissible: EasyComponents.boolean(false), onDismiss: EasyComponents.event() }, template, styles, scoped: true });
