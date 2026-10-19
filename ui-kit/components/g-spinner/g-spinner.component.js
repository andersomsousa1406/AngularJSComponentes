import template from './g-spinner.html';
import styles from './g-spinner.css';
export default EasyComponents.defineComponent('g-spinner', { props: { label: EasyComponents.text('Carregando'), size: EasyComponents.text('md') }, template, styles, scoped: true });
