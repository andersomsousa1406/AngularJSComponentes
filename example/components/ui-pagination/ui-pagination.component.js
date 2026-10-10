import template from './ui-pagination.html';
import styles from './ui-pagination.css';

export default function registerUiPagination(app) {
  return app.component('uiPagination', {
    props: {
      page: { type: Number, default: 1 },
      total: { type: Number, default: 1 },
      onChange: Function
    },
    computed: {
      pages: function () {
        var values = [];
        for (var page = 1; page <= this.total; page += 1) values.push(page);
        return values;
      }
    },
    methods: {
      go: function (page) {
        if (page >= 1 && page <= this.total && page !== this.page) this.$emit('onChange', page);
      }
    },
    template: template,
    styles: styles
  });
}
