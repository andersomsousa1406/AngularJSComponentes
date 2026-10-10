import template from './task-item.html';
import styles from './task-item.css';

export default function registerTaskItem(app) {
  return app.component('taskItem', {
    props: {
      task: { type: Object, required: true },
      onToggle: Function
    },
    methods: {
      toggle: function () {
        this.$emit('onToggle', this.task);
      }
    },
    template: template,
    styles: styles
  });
}
