import template from './app-root.html';
import styles from './app-root.css';

export default function registerAppRoot(app) {
  return app.component('appRoot', {
    state: {
      start: 2,
      step: 1,
      lastValue: null
    },

    methods: {
      record: function (value) {
        this.$setState({ lastValue: value });
      }
    },

    template: template,
    styles: styles
  });
}
