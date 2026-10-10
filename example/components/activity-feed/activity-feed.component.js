import template from './activity-feed.html';
import styles from './activity-feed.css';

export default function registerActivityFeed(app) {
  return app.component('activityFeed', {
    props: {
      items: { type: Array, default: function () { return []; } }
    },
    computed: {
      total: function () {
        return this.items.length;
      }
    },
    template: template,
    styles: styles
  });
}
