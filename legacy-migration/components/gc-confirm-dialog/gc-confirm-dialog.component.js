import template from './gc-confirm-dialog.html';
import styles from './gc-confirm-dialog.css';
import { createConfirmationQueue } from './confirmation-queue.js';

export default EasyComponents.defineComponent('gc-confirm-dialog', {
  inject: { timeout: '$timeout' },
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
    onCancel: EasyComponents.event(),
    onReady: EasyComponents.event(),
    onError: EasyComponents.event()
  },

  state: function () { return { dialogs: null }; },

  hooks: {
    onInit: function () {
      var vm = this;
      vm.dialogs = createConfirmationQueue(vm.timeout, vm.timeout.cancel,
        function () { vm.$setState({ dialogs: vm.dialogs }); },
        function (error) { vm.$emit('onError', error); });
      vm.$emit('onReady', vm.dialogs);
    },
    onDestroy: function () { if (this.dialogs) this.dialogs.destroy(); }
  },

  methods: {
    add: function () { return this.dialogs.add.apply(this.dialogs, arguments); },
    closeAll: function () { return this.dialogs.closeAll(); },
    dialogKeydown: function (event, dialog) {
      var key = { Escape: 'esc', Enter: 'enter', F1: 'f1' }[event.key];
      if (!key) return;
      var button = dialog.botao.find(function (item) { return item.hotkey === key; });
      if (button) { event.preventDefault(); event.stopPropagation(); button.executar(event, button); }
      else if (key === 'esc' && dialog.tipo === 2) dialog.cancelar(event);
    },
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
