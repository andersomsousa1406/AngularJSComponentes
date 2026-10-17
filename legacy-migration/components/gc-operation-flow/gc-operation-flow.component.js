import template from './gc-operation-flow.html';
import styles from './gc-operation-flow.css';

export default EasyComponents.defineComponent('gc-operation-flow', {
  props: {
    title: EasyComponents.text('Fluxo operacional'),
    steps: EasyComponents.array(function () { return []; }),
    current: EasyComponents.number(0),
    running: EasyComponents.boolean(false),
    onExecute: EasyComponents.event(),
    onCancel: EasyComponents.event(),
    onSelect: EasyComponents.event()
  },

  methods: {
    execute: function () { if (!this.running) this.$emit('onExecute', this.steps[this.current]); },
    cancel: function () { if (this.running) this.$emit('onCancel', this.steps[this.current]); },
    select: function (step, index) { if (!this.running) this.$emit('onSelect', { step: step, index: index }); },
    statusClass: function (step, index) {
      if (step.status === 'error') return 'danger';
      if (step.status === 'done' || index < this.current) return 'success';
      if (index === this.current) return 'primary';
      return 'default';
    }
  },

  template: template,
  styles: styles,
  scoped: true
});
