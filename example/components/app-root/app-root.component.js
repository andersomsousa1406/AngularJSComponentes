import template from './app-root.html';
import styles from './app-root.css';

export default function registerAppRoot(app) {
  return app.component('appRoot', {
    state: {
      start: 2,
      step: 1,
      lastValue: null,
      theme: 'violet',
      menuOpen: false,
      activities: [
        { id: 1, type: 'system', title: 'Aplicacao iniciada', detail: 'Bootstrap automatico executado uma unica vez.' },
        { id: 2, type: 'success', title: '10 componentes registrados', detail: 'Templates e estilos vieram no mesmo bundle.' }
      ]
    },

    methods: {
      record: function (value) {
        this.addActivity('event', 'Evento recebido do contador', 'Novo valor: ' + value);
        this.$setState({ lastValue: value });
      },
      changeTheme: function (theme) {
        this.$setState({ theme: theme });
        this.addActivity('theme', 'Tema alterado', 'A interface agora usa a paleta ' + theme + '.');
      },
      recordTask: function (task) {
        this.addActivity(
          task.done ? 'success' : 'event',
          task.done ? 'Tarefa concluida' : 'Tarefa reaberta',
          task.title
        );
      },
      addActivity: function (type, title, detail) {
        var next = [{
          id: Date.now() + Math.random(),
          type: type,
          title: title,
          detail: detail
        }].concat(this.activities).slice(0, 5);
        this.$setState({ activities: next });
      },
      toggleMenu: function () {
        this.$setState({ menuOpen: !this.menuOpen });
      },
      closeMenu: function () {
        this.$setState({ menuOpen: false });
      }
    },

    template: template,
    styles: styles
  });
}
