import template from './g-empty-state.html';
import styles from './g-empty-state.css';
export default EasyComponents.defineComponent('g-empty-state', { transclude: true, props: { title: EasyComponents.text('Nenhum registro encontrado'), description: EasyComponents.text('Ajuste os filtros ou adicione o primeiro registro.'), icon: EasyComponents.text('folder') }, template, styles, scoped: true });
