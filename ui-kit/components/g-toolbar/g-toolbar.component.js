import template from './g-toolbar.html';
import styles from './g-toolbar.css';
export default EasyComponents.defineComponent('g-toolbar', { transclude: true, props: { title: EasyComponents.text(''), description: EasyComponents.text(''), eyebrow: EasyComponents.text('') }, template, styles, scoped: true });
