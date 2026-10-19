import template from './g-status.html';
import styles from './g-status.css';
export default EasyComponents.defineComponent('g-status', { props: { status: EasyComponents.text('0'), label: EasyComponents.text(''), list: EasyComponents.object(() => ({ '1': '#18865f', '0': '#d63e50' })) }, computed: { color: function () { return this.list[this.status] || '#8792a5'; } }, template, styles, scoped: true });
