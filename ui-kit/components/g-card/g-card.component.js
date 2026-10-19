import template from './g-card.html';
import styles from './g-card.css';
export default EasyComponents.defineComponent('g-card', { transclude: true, props: { title: EasyComponents.text(''), description: EasyComponents.text(''), icon: EasyComponents.text(''), padded: EasyComponents.boolean(true) }, template, styles, scoped: true });
