import template from './task-board.html';
import styles from './task-board.css';

export default function registerTaskBoard(app) {
  return app.component('taskBoard', {
    props: {
      onActivity: Function
    },
    state: {
      filter: 'all',
      createdCount: 0,
      tasks: [
        { id: 1, title: 'Criar componente de perfil', category: 'Interface', points: 3, done: true },
        { id: 2, title: 'Conectar evento on-save', category: 'Integracao', points: 5, done: false },
        { id: 3, title: 'Validar props obrigatorias', category: 'Qualidade', points: 2, done: false },
        { id: 4, title: 'Executar benchmark local', category: 'Performance', points: 8, done: true }
      ]
    },
    computed: {
      doneCount: function () {
        return this.tasks.filter(function (task) { return task.done; }).length;
      },
      progress: function () {
        return Math.round((this.doneCount / this.tasks.length) * 100);
      },
      visibleTasks: function () {
        var filter = this.filter;
        if (filter === 'all') return this.tasks;
        return this.tasks.filter(function (task) {
          return filter === 'done' ? task.done : !task.done;
        });
      }
    },
    methods: {
      setFilter: function (filter) {
        this.$setState({ filter: filter });
      },
      toggleTask: function (selected) {
        var changed;
        var tasks = this.tasks.map(function (task) {
          if (task.id !== selected.id) return task;
          changed = Object.assign({}, task, { done: !task.done });
          return changed;
        });
        this.$setState({ tasks: tasks });
        this.$emit('onActivity', changed);
      },
      addTask: function () {
        var number = this.createdCount + 1;
        var task = { id: Date.now(), title: 'Novo componente #' + number, category: 'Backlog', points: 3, done: false };
        this.$setState({ tasks: this.tasks.concat(task), createdCount: number, filter: 'all' });
        this.$emit('onActivity', task);
      }
    },
    template: template,
    styles: styles
  });
}
