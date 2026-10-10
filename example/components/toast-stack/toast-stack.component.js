import template from './toast-stack.html';
import styles from './toast-stack.css';

export default function registerToastStack(app) {
  return app.component('toastStack', {
    props: {
      items: { type: Array, default: function () { return []; } },
      onDismiss: Function
    },
    methods: {
      dismiss: function (item) { this.$emit('onDismiss', item.id); }
    },
    template: template,
    styles: styles
  });
}
