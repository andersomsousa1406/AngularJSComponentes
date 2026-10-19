import template from './gc-history-panel.html';
import styles from './gc-history-panel.css';

export default EasyComponents.defineComponent('gc-history-panel', {
  inject: { api: 'GcApi' },
  props: {
    title: EasyComponents.text('Historico'),
    entries: EasyComponents.array(function () { return []; }),
    loading: EasyComponents.boolean(false),
    args: EasyComponents.object(null),
    pageSize: EasyComponents.number(50),
    onReady: EasyComponents.event(),
    onError: EasyComponents.event(),
    onSelect: EasyComponents.event(),
    onRefresh: EasyComponents.event()
  },

  state: function () {
    return {
      ARGS: {}, DADOS: this.entries, FILTRO_DADOS: '', FILTRO_TABELA_ID: '', page: 0, busy: false, generation: 0,
      columns: [
        { key: 'DATA', label: 'Data', width: '150px' },
        { key: 'USUARIO', label: 'Usuario', width: '180px' },
        { key: 'DESCRICAO', label: 'Descricao' }
      ]
    };
  },

  methods: {
    consultar: function (page) {
      var vm = this;
      if (page !== undefined) vm.page = page;
      var generation = ++vm.generation;
      Object.assign(vm.ARGS, vm.args || {}, { FILTRO: vm.FILTRO_DADOS, FILTRO_TABELA_ID: vm.FILTRO_TABELA_ID,
        QTD: vm.pageSize, PAGINA: vm.page * vm.pageSize });
      vm.$setState({ busy: true });
      return vm.api.post('/api/historico', vm.ARGS).then(function (rows) {
        if (generation === vm.generation) vm.$setState({ DADOS: rows }); return rows;
      }).catch(function (error) { if (generation === vm.generation) vm.$emit('onError', error); throw error; })
        .finally(function () { if (generation === vm.generation) vm.$setState({ busy: false }); });
    },
    getHistorico: function (page) { return this.consultar(page); },
    refresh: function () { this.$emit('onRefresh', null); if (this.args) return this.consultar(0).catch(function () {}); },
    select: function (entry) { this.$emit('onSelect', entry); }
  },

  hooks: {
    onInit: function () { this.$emit('onReady', this); },
    onChanges: function (changes) { if (changes.entries) this.DADOS = changes.entries.currentValue || []; },
    onDestroy: function () { ++this.generation; }
  },

  template: template,
  styles: styles,
  scoped: true
});
