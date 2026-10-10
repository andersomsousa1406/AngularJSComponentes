import template from './data-table.html';
import styles from './data-table.css';

var INITIAL_ROWS = [
  { id: 'EC-1048', name: 'Dashboard financeiro', owner: 'Ana Lima', initials: 'AL', status: 'active', date: '10 out 2026', value: 18400 },
  { id: 'EC-1047', name: 'Portal de clientes', owner: 'Carlos Melo', initials: 'CM', status: 'pending', date: '09 out 2026', value: 12750 },
  { id: 'EC-1046', name: 'Painel operacional', owner: 'Joao Reis', initials: 'JR', status: 'active', date: '08 out 2026', value: 9600 },
  { id: 'EC-1045', name: 'Catalogo interno', owner: 'Bianca Luz', initials: 'BL', status: 'inactive', date: '07 out 2026', value: 7200 },
  { id: 'EC-1044', name: 'Central de suporte', owner: 'Marina Alves', initials: 'MA', status: 'active', date: '06 out 2026', value: 15300 },
  { id: 'EC-1043', name: 'Gestao de contratos', owner: 'Rafael Dias', initials: 'RD', status: 'pending', date: '05 out 2026', value: 11800 },
  { id: 'EC-1042', name: 'Relatorios executivos', owner: 'Luiza Costa', initials: 'LC', status: 'active', date: '04 out 2026', value: 22100 },
  { id: 'EC-1041', name: 'Onboarding digital', owner: 'Pedro Nunes', initials: 'PN', status: 'inactive', date: '03 out 2026', value: 6400 }
];

export default function registerDataTable(app) {
  return app.component('recordsTable', {
    state: {
      rows: INITIAL_ROWS,
      query: '',
      status: 'all',
      page: 1,
      perPage: 4,
      sortKey: 'id',
      sortDirection: 'desc',
      statusOptions: [
        { value: 'all', label: 'Todos os status' },
        { value: 'active', label: 'Ativos' },
        { value: 'pending', label: 'Pendentes' },
        { value: 'inactive', label: 'Inativos' }
      ]
    },
    computed: {
      filteredRows: function () {
        var query = this.query.toLowerCase();
        var status = this.status;
        var key = this.sortKey;
        var direction = this.sortDirection === 'asc' ? 1 : -1;
        return this.rows.filter(function (row) {
          var matchesQuery = !query || (row.id + row.name + row.owner).toLowerCase().indexOf(query) !== -1;
          var matchesStatus = status === 'all' || row.status === status;
          return matchesQuery && matchesStatus;
        }).sort(function (left, right) {
          if (left[key] < right[key]) return -1 * direction;
          if (left[key] > right[key]) return 1 * direction;
          return 0;
        });
      },
      pageCount: function () {
        return Math.max(1, Math.ceil(this.filteredRows.length / this.perPage));
      },
      visibleRows: function () {
        var start = (this.page - 1) * this.perPage;
        return this.filteredRows.slice(start, start + this.perPage);
      }
    },
    methods: {
      setStatus: function (status) { this.$setState({ status: status || 'all', page: 1 }); },
      setPage: function (page) { this.$setState({ page: page }); },
      search: function () { this.$setState({ page: 1 }); },
      sort: function (key) {
        this.$setState({
          sortKey: key,
          sortDirection: this.sortKey === key && this.sortDirection === 'asc' ? 'desc' : 'asc'
        });
      },
      statusLabel: function (status) { return { active: 'Ativo', pending: 'Pendente', inactive: 'Inativo' }[status]; },
      statusVariant: function (status) { return { active: 'success', pending: 'warning', inactive: 'neutral' }[status]; }
    },
    template: template,
    styles: styles
  });
}
