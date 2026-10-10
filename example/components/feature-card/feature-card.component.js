import template from './feature-card.html';
import styles from './feature-card.css';

export default function registerFeatureCard(app) {
  return app.component('featureCard', {
    props: {
      icon: { type: String, binding: '@' },
      tag: { type: String, binding: '@' },
      title: { type: String, binding: '@', required: true },
      description: { type: String, binding: '@', required: true },
      accent: { type: String, binding: '@', default: 'violet' }
    },
    transclude: true,
    template: template,
    styles: styles
  });
}
