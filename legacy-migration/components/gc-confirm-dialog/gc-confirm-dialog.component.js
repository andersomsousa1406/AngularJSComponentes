import template from './gc-confirm-dialog.html';
import styles from './gc-confirm-dialog.css';

export default EasyComponents.defineComponent('gc-confirm-dialog', {
  props: {
    open: EasyComponents.boolean(false),
    title: EasyComponents.text('Confirmacao'),
    message: EasyComponents.text('Deseja continuar?'),
    confirmLabel: EasyComponents.text('Confirmar'),
    cancelLabel: EasyComponents.text('Cancelar'),
    confirmClass: EasyComponents.text('btn-primary'),
    size: EasyComponents.text(''),
    busy: EasyComponents.boolean(false),
    closeOnBackdrop: EasyComponents.boolean(true),
    onConfirm: EasyComponents.event(),
    onCancel: EasyComponents.event()
  },

  methods: {
    confirm: function () {
      if (!this.busy) this.$emit('onConfirm', { reason: 'confirm' });
    },
    cancel: function (reason) {
      if (!this.busy) this.$emit('onCancel', { reason: reason || 'cancel' });
    },
    backdrop: function () {
      if (this.closeOnBackdrop) this.cancel('backdrop');
    },
    keydown: function (event) {
      if (event.key === 'Escape') this.cancel('escape');
      if (event.key === 'Enter') this.confirm();
    }
  },

  transclude: true,
  template: template,
  styles: styles,
  scoped: true
});
