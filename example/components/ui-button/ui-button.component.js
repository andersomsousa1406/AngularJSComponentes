import template from './ui-button.html';
import styles from './ui-button.css';

export default function registerUiButton(app) {
  return app.component('uiButton', {
    props: {
      label: { type: String, binding: '@', required: true },
      variant: { type: String, binding: '@', default: 'primary' },
      size: { type: String, binding: '@', default: 'medium' },
      icon: { type: String, binding: '@' },
      disabled: { type: Boolean, default: false },
      onClick: Function
    },
    methods: {
      click: function () {
        if (!this.disabled) this.$emit('onClick', { label: this.label, variant: this.variant });
      }
    },
    template: template,
    styles: styles
  });
}
