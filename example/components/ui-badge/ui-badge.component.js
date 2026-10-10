import template from './ui-badge.html';
import styles from './ui-badge.css';

export default function registerUiBadge(app) {
  return app.component('uiBadge', {
    props: {
      label: { type: String, binding: '@', required: true },
      variant: { type: String, binding: '@', default: 'neutral' },
      dot: { type: Boolean, default: false }
    },
    template: template,
    styles: styles
  });
}
