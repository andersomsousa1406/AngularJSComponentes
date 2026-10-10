import template from './counter-card.html';
import styles from './counter-card.css';

export default function registerCounterCard(app) {
  return app.component('counterCard', {
    props: {
      title: { type: String, binding: '@', default: 'Contador' },
      initial: { type: Number, default: 0 },
      step: { type: Number, default: 1, validator: function (value) { return value > 0; } },
      onChange: Function
    },

    state: function () {
      return { count: this.initial };
    },

    computed: {
      doubled: function () { return this.count * 2; }
    },

    methods: {
      increment: function () {
        this.$setState({ count: this.count + this.step });
        this.$emit('onChange', this.count);
      },
      decrement: function () {
        this.$setState(function () { return { count: this.count - this.step }; });
        this.$emit('onChange', this.count);
      }
    },

    hooks: {
      onInit: function () {
        this.startedAt = new Date();
      }
    },

    transclude: true,
    template: template,
    styles: styles
  });
}
