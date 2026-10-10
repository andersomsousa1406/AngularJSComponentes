import template from './stat-card.html';
import styles from './stat-card.css';

export default function registerStatCard(app) {
  return app.component('statCard', {
    props: {
      label: { type: String, binding: '@', required: true },
      value: { type: String, binding: '@', required: true },
      change: { type: String, binding: '@' },
      trend: { type: String, binding: '@', default: 'up' },
      icon: { type: String, binding: '@', default: '◆' }
    },
    template: template,
    styles: styles
  });
}
