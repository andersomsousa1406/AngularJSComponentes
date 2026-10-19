import template from './catalog.html';
import styles from './catalog.css';
export default EasyComponents.defineComponent('g-catalog', {
  inject: { toast: 'GToast', timeout: '$timeout' },
  state: function () { return {
    active: 'buttons', color: 'primary', variant: 'solid', size: 'md', shape: 'rounded', disabled: false, previewLoading: false,
    name: '', email: '', department: '', notifications: true, search: '', selectedModule: null, modalOpen: false, modalName: '', modalError: '', saving: false, view: 'list', events: [],
    tabs: [{ id: 'buttons', label: 'Botões e ações', icon: 'add' }, { id: 'forms', label: 'Campos e buscas', icon: 'search' }, { id: 'feedback', label: 'Feedback e diálogos', icon: 'info' }, { id: 'layout', label: 'Estrutura e conteúdo', icon: 'folder' }],
    colors: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
    colorOptions: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].map(value => ({ value, label: value })),
    variantOptions: ['solid', 'outline', 'ghost'].map(value => ({ value, label: value })), sizeOptions: ['sm', 'md', 'lg', 'xl', 'xxl'].map(value => ({ value, label: value })),
    shapeOptions: [{ value: 'rounded', label: 'Arredondado' }, { value: 'pill', label: 'Pílula' }, { value: 'square', label: 'Reto' }],
    departments: [{ value: 'comercial', label: 'Comercial' }, { value: 'financeiro', label: 'Financeiro' }, { value: 'producao', label: 'Produção' }],
    views: [{ value: 'list', label: 'Lista', icon: 'filter' }, { value: 'cards', label: 'Cards', icon: 'folder' }, { value: 'settings', label: 'Ajustes', icon: 'settings' }],
    modules: [
      { CONTROLE: '22430', GRUPO: 'Produção', DESCRICAO: 'Modelos e fichas técnicas', icon: 'folder', color: 'primary' },
      { CONTROLE: '19160', GRUPO: 'Comercial', DESCRICAO: 'Pedidos de venda', icon: 'download', color: 'info' },
      { CONTROLE: '11640', GRUPO: 'Cadastros', DESCRICAO: 'Perfis e usuários', icon: 'user', color: 'success' },
      { CONTROLE: '27080', GRUPO: 'Cadastros', DESCRICAO: 'Famílias de produto', icon: 'folder', color: 'primary' }
    ]
  }; },
  methods: {
    navigate: function (id) { this.active = id; },
    record: function (text) { this.events = [{ text, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }].concat(this.events).slice(0, 4); },
    action: function (text) { this.record(text); this.toast.success(text, 'A ação foi recebida pelo componente da página.'); },
    selectModule: function (module) { this.selectedModule = module; this.search = module.CONTROLE + ' — ' + module.DESCRICAO; this.record('Selecionado: ' + module.DESCRICAO); },
    save: function () { if (this.saving) return; this.saving = true; this._saveTimer = this.timeout(() => { this.saving = false; this.action('Dados gravados'); }, 650); },
    confirm: function () { if (!this.modalName.trim()) { this.modalError = 'Informe o nome do registro.'; return; } this.modalOpen = false; this.action('Registro criado: ' + this.modalName.trim()); this.modalName = ''; this.modalError = ''; },
    notice: function (color) { this.toast.show({ success: 'Tudo certo!', danger: 'Não foi possível concluir', warning: 'Confira as informações', info: 'Uma nova atualização' }[color], 'Uma mensagem curta, clara e pronta para a sua aplicação.', color); }
  },
  hooks: { onDestroy: function () { if (this._saveTimer) this.timeout.cancel(this._saveTimer); } },
  template, styles, scoped: true
});
