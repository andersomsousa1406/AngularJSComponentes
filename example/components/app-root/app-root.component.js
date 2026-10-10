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
      scrolled: false,
      scrollProgress: 0,
      activeSection: 'inicio',
      showBackTop: false,
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
      },
      updateScroll: function () {
        var top = window.pageYOffset || document.documentElement.scrollTop || 0;
        var height = document.documentElement.scrollHeight - window.innerHeight;
        var sectionIds = ['inicio', 'recursos', 'componentes', 'biblioteca', 'desempenho', 'comecar'];
        var active = 'inicio';
        sectionIds.forEach(function (id) {
          var section = document.getElementById(id);
          if (section && section.offsetTop <= top + 180) active = id;
        });
        this.$setState({
          scrolled: top > 20,
          showBackTop: top > 700,
          activeSection: active,
          scrollProgress: height > 0 ? Math.min(100, Math.round((top / height) * 1000) / 10) : 0
        });
      },
      scrollTop: function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    hooks: {
      postLink: function () {
        var vm = this;
        vm.__scrollFrame = null;
        vm.__scrollHandler = function () {
          if (vm.__scrollFrame) return;
          vm.__scrollFrame = window.requestAnimationFrame(function () {
            vm.__scrollFrame = null;
            vm.updateScroll();
          });
        };
        window.addEventListener('scroll', vm.__scrollHandler, { passive: true });
        vm.updateScroll();
      },
      onDestroy: function () {
        window.removeEventListener('scroll', this.__scrollHandler);
        if (this.__scrollFrame) window.cancelAnimationFrame(this.__scrollFrame);
      }
    },

    template: template,
    styles: styles
  });
}
