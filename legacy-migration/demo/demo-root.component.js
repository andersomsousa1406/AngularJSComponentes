import template from './demo-root.html';
import styles from './demo-root.css';

var PEOPLE = [
  { ID: 1, NOME: 'Ana Lima', EMAIL: 'ana@empresa.com', CIDADE: 'Fortaleza' },
  { ID: 2, NOME: 'Bruno Reis', EMAIL: 'bruno@empresa.com', CIDADE: 'Recife' },
  { ID: 3, NOME: 'Carla Souza', EMAIL: 'carla@empresa.com', CIDADE: 'Natal' },
  { ID: 4, NOME: 'Diego Alves', EMAIL: 'diego@empresa.com', CIDADE: 'Teresina' }
];

export default EasyComponents.defineComponent('legacy-demo-root', {
  state: function () {
    return {
      dialogOpen: false,
      message: 'Pronto para testar.',
      people: PEOPLE,
      selectedPerson: null,
      selectedPeople: [PEOPLE[0]],
      columns: [
        { key: 'ID', label: 'Codigo', width: '90px' },
        { key: 'NOME', label: 'Nome' },
        { key: 'EMAIL', label: 'E-mail' },
        { key: 'CIDADE', label: 'Cidade' }
      ],
      history: [
        { ID: 1, DATA: '17/10/2026 10:20', USUARIO: 'admin', DESCRICAO: 'Cadastro criado' },
        { ID: 2, DATA: '17/10/2026 10:31', USUARIO: 'ana', DESCRICAO: 'Endereco atualizado' }
      ],
      steps: [
        { id: 1, title: 'Validar', description: 'Confere os dados', status: 'done', progress: 100 },
        { id: 2, title: 'Processar', description: 'Executa a operacao', status: 'ready', progress: 45 },
        { id: 3, title: 'Finalizar', description: 'Grava o resultado', status: 'waiting', progress: 0 }
      ],
      running: false
    };
  },

  methods: {
    selectPerson: function (person) { this.$setState({ selectedPerson: person, message: 'Selecionado: ' + person.NOME }); },
    clearPerson: function () { this.$setState({ selectedPerson: null, message: 'Selecao limpa.' }); },
    updatePeople: function (people) { this.$setState({ selectedPeople: people }); },
    openDialog: function () { this.$setState({ dialogOpen: true }); },
    closeDialog: function () { this.$setState({ dialogOpen: false, message: 'Operacao cancelada.' }); },
    confirmDialog: function () { this.$setState({ dialogOpen: false, message: 'Operacao confirmada.' }); },
    startFlow: function () { this.$setState({ running: true, message: 'Fluxo iniciado.' }); },
    stopFlow: function () { this.$setState({ running: false, message: 'Fluxo interrompido.' }); },
    filesAdded: function (files) { this.$setState({ message: (Array.isArray(files) ? files.length : 1) + ' arquivo(s) adicionado(s).' }); },
    importRows: function (data) { this.$setState({ message: data.rows.length + ' linha(s) prontas para o backend.' }); }
  },

  template: template,
  styles: styles,
  scoped: true
});
