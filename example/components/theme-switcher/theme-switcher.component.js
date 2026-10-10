import template from './theme-switcher.html';
import styles from './theme-switcher.css';

export default function registerThemeSwitcher(app) {
  return app.component('themeSwitcher', {
    props: {
      value: { type: String, default: 'violet' },
      onChange: Function
    },
    state: {
      themes: [
        { id: 'violet', label: 'Violeta', color: '#8b5cf6' },
        { id: 'cyan', label: 'Ciano', color: '#22d3ee' },
        { id: 'orange', label: 'Laranja', color: '#fb923c' },
        { id: 'green', label: 'Verde', color: '#34d399' }
      ]
    },
    computed: {
      currentLabel: function () {
        var current = this.value;
        var match = this.themes.find(function (theme) { return theme.id === current; });
        return match ? match.label : current;
      }
    },
    methods: {
      choose: function (theme) {
        this.$emit('onChange', theme.id);
      }
    },
    template: template,
    styles: styles
  });
}
