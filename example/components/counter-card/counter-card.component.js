import template from './counter-card.html';
import styles from './counter-card.css';

export default EasyComponents.defineComponent('counter-card', {
  props: {
    title: EasyComponents.text('Contador'),
    initial: EasyComponents.number(0),
    step: EasyComponents.number(1, function (value) { return value > 0; }),
    onChange: EasyComponents.event()
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
