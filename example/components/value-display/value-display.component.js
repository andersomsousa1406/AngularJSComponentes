import template from './value-display.html';
import styles from './value-display.css';

export default function registerValueDisplay(app) {
  return app.component('valueDisplay', {
    props: {
      label: { type: String, binding: '@', default: 'Valor recebido' },
      value: { binding: '<' }
    },

    template: template,
    styles: styles
  });
}
