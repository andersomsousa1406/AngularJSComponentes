import template from './ui-tabs.html';
import styles from './ui-tabs.css';

export default function registerUiTabs(app) {
  return app.component('uiTabs', {
    props: {
      tabs: { type: Array, required: true },
      active: { type: String, required: true },
      onChange: Function
    },
    transclude: true,
    methods: {
      select: function (tab) {
        if (!tab.disabled) this.$emit('onChange', tab.id);
      }
    },
    template: template,
    styles: styles
  });
}
