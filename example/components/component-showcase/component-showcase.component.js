import template from './component-showcase.html';
import styles from './component-showcase.css';

export default function registerComponentShowcase(app) {
  return app.component('componentShowcase', {
    state: {
      activeTab: 'base',
      modalOpen: false,
      selectedProduct: null,
      lastAction: 'Nenhuma acao executada',
      tabs: [
        { id: 'base', label: 'Elementos', icon: '◇', count: 4 },
        { id: 'data', label: 'Dados e tabela', icon: '▦', count: 3 },
        { id: 'cards', label: 'Cards e listas', icon: '▤', count: 4 },
        { id: 'forms', label: 'Formularios', icon: '⌁', count: 3 }
      ],
      products: [
        { id: 1, name: 'Workspace Pro', category: 'Produtividade', description: 'Painel completo para equipes e projetos complexos.', price: 89, icon: 'W', tag: 'Popular', badge: 'primary', color: 'violet' },
        { id: 2, name: 'Analytics Kit', category: 'Dados', description: 'Graficos, metricas e relatorios prontos para conectar.', price: 64, icon: 'A', tag: 'Novo', badge: 'info', color: 'cyan' },
        { id: 3, name: 'Commerce UI', category: 'E-commerce', description: 'Componentes para catalogos e jornadas de compra.', price: 72, icon: 'C', tag: 'Completo', badge: 'warning', color: 'orange' }
      ],
      users: [
        { name: 'Ana Lima', email: 'ana@equipe.dev', initials: 'AL', role: 'Admin', online: true, color: 'violet' },
        { name: 'Carlos Melo', email: 'carlos@equipe.dev', initials: 'CM', role: 'Editor', online: true, color: 'cyan' },
        { name: 'Bianca Luz', email: 'bianca@equipe.dev', initials: 'BL', role: 'Viewer', online: false, color: 'orange' },
        { name: 'Rafael Dias', email: 'rafael@equipe.dev', initials: 'RD', role: 'Editor', online: true, color: 'green' }
      ]
    },
    methods: {
      changeTab: function (tab) { this.$setState({ activeTab: tab }); },
      handleAction: function (event) { this.$setState({ lastAction: 'Botao ' + event.label + ' acionado' }); },
      selectProduct: function (product) { this.$setState({ selectedProduct: product, modalOpen: true }); },
      openModal: function () { this.$setState({ selectedProduct: null, modalOpen: true }); },
      closeModal: function () { this.$setState({ modalOpen: false }); },
      confirmModal: function () { this.$setState({ modalOpen: false, lastAction: 'Acao do modal confirmada' }); }
    },
    template: template,
    styles: styles
  });
}
