import template from './g-icon.html';
import styles from './g-icon.css';
const paths = {
  add: 'M12 5v14M5 12h14', check: 'm5 12 4 4L19 6', close: 'm6 6 12 12M6 18 18 6',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h10V3M7 21v-8h10v8',
  home: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  download: 'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  arrow: 'M5 12h14m-6-6 6 6-6 6', chevron: 'm6 9 6 6 6-6',
  folder: 'M3 7V4h6l3 3h9v13H3V7Z', user: 'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  filter: 'M3 4h18l-7 8v7l-4 2v-9L3 4Z', info: 'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'
};
export default EasyComponents.defineComponent('g-icon', {
  props: { name: EasyComponents.text(''), label: EasyComponents.text('') },
  computed: { path: function () { return paths[this.name] || paths.info; } },
  template, styles, scoped: true
});
