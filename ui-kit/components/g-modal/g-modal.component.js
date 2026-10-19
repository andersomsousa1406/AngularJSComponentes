import template from './g-modal.html';
import styles from './g-modal.css';
let sequence = 0;
export default EasyComponents.defineComponent('g-modal', {
  inject: { timeout: '$timeout', scope: '$scope' }, transclude: true,
  props: { open: EasyComponents.boolean(false), title: EasyComponents.text(''), description: EasyComponents.text(''), size: EasyComponents.text('md'), busy: EasyComponents.boolean(false), closeOnBackdrop: EasyComponents.boolean(true), confirmText: EasyComponents.text('Confirmar'), cancelText: EasyComponents.text('Cancelar'), onClose: EasyComponents.event(), onConfirm: EasyComponents.event() },
  state: function () { return { uid: 'g-dialog-' + ++sequence }; },
  methods: {
    close: function (reason) { if (!this.busy) this.$emit('onClose', reason); },
    confirm: function () { if (!this.busy) this.$emit('onConfirm'); },
    backdrop: function (event) {
      if (!this.closeOnBackdrop || event.target !== this._dialog) return;
      const rect = this._dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.close('backdrop');
    },
    sync: function () { if (!this._dialog) return; if (this.open && !this._dialog.open) this._dialog.showModal(); else if (!this.open && this._dialog.open) this._dialog.close(); }
  },
  hooks: {
    postLink: function () {
      const vm = this; vm._dialog = vm.$element[0].querySelector('dialog');
      vm._cancel = event => { event.preventDefault(); vm.scope.$evalAsync(() => vm.close('escape')); };
      vm._dialog.addEventListener('cancel', vm._cancel); vm.sync();
    },
    onChanges: function () { if (this._pending) this.timeout.cancel(this._pending); this._pending = this.timeout(() => this.sync(), 0); },
    onDestroy: function () { this.timeout.cancel(this._pending); if (this._dialog) { this._dialog.removeEventListener('cancel', this._cancel); this._dialog.close(); } }
  }, template, styles, scoped: true
});
