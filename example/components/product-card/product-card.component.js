import template from './product-card.html';
import styles from './product-card.css';

export default function registerProductCard(app) {
  return app.component('productCard', {
    props: {
      product: { type: Object, required: true },
      onSelect: Function
    },
    methods: {
      select: function () { this.$emit('onSelect', this.product); }
    },
    template: template,
    styles: styles
  });
}
