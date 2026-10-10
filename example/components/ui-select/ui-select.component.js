import template from './ui-select.html';
import styles from './ui-select.css';

export default function registerUiSelect(app) {
  return app.component('uiSelect', {
    props: {
      label: { type: String, binding: '@' },
      options: { type: Array, required: true },
      value: { type: String },
      placeholder: { type: String, binding: '@', default: 'Selecione' },
      onChange: Function
    },
    methods: {
      changed: function () { this.$emit('onChange', this.value); }
    },
    template: template,
    styles: styles
  });
}
