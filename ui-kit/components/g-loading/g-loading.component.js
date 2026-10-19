import template from './g-loading.html';
import styles from './g-loading.css';
export default EasyComponents.defineComponent('g-loading', { props: { active: EasyComponents.boolean(true), text: EasyComponents.text('Carregando informações...'), progress: EasyComponents.number(-1), overlay: EasyComponents.boolean(false) }, template, styles, scoped: true });
