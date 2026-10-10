import template from './ui-alert.html';
import styles from './ui-alert.css';

export default function registerUiAlert(app) {
  return app.component('uiAlert', {
    props: {
      title: { type: String, binding: '@', required: true },
      message: { type: String, binding: '@', required: true },
      variant: { type: String, binding: '@', default: 'info' },
      dismissible: { type: Boolean, default: false }
    },
    state: { visible: true },
    computed: {
      icon: function () {
        return { success: '✓', warning: '!', danger: '×', info: 'i' }[this.variant] || 'i';
      }
    },
    methods: {
      dismiss: function () { this.$setState({ visible: false }); }
    },
    template: template,
    styles: styles
  });
}
