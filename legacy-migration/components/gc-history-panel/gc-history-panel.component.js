import template from './gc-history-panel.html';
import styles from './gc-history-panel.css';

export default EasyComponents.defineComponent('gc-history-panel', {
  props: {
    title: EasyComponents.text('Historico'),
    entries: EasyComponents.array(function () { return []; }),
    loading: EasyComponents.boolean(false),
    onSelect: EasyComponents.event(),
    onRefresh: EasyComponents.event()
  },

  state: function () {
    return {
      columns: [
        { key: 'DATA', label: 'Data', width: '150px' },
        { key: 'USUARIO', label: 'Usuario', width: '180px' },
        { key: 'DESCRICAO', label: 'Descricao' }
      ]
    };
  },

  methods: {
    refresh: function () { this.$emit('onRefresh', null); },
    select: function (entry) { this.$emit('onSelect', entry); }
  },

  template: template,
  styles: styles,
  scoped: true
});
