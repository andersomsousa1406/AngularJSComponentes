import template from './ui-modal.html';
import styles from './ui-modal.css';

export default function registerUiModal(app) {
  return app.component('uiModal', {
    props: {
      open: { type: Boolean, default: false },
      title: { type: String, binding: '@', default: 'Confirmar acao' },
      onClose: Function,
      onConfirm: Function
    },
    transclude: true,
    methods: {
      close: function () { this.$emit('onClose'); },
      confirm: function () { this.$emit('onConfirm'); }
    },
    template: template,
    styles: styles
  });
}
