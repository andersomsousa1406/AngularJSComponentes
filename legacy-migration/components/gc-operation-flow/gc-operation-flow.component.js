import template from './gc-operation-flow.html';
import styles from './gc-operation-flow.css';
import { createFlowClient } from '../../services/flow-client.js';

export default EasyComponents.defineComponent('gc-operation-flow', {
  inject: { api: 'GcApi' },
  props: {
    title: EasyComponents.text('Fluxo operacional'),
    steps: EasyComponents.array(function () { return []; }),
    current: EasyComponents.number(0),
    running: EasyComponents.boolean(false),
    config: EasyComponents.object(null),
    onReady: EasyComponents.event(),
    onError: EasyComponents.event(),
    onExecute: EasyComponents.event(),
    onCancel: EasyComponents.event(),
    onSelect: EasyComponents.event()
  },

  state: function () { return { flow: null, error: '' }; },

  hooks: {
    onInit: function () {
      if (!this.config) return;
      var vm = this;
      vm.flow = createFlowClient(vm.api, vm.config, { notify: function () { if (vm.flow) vm.$setState({ flow: vm.flow }); } });
      vm.$emit('onReady', vm.flow);
    },
    onDestroy: function () { if (this.flow) this.flow.destroy(); }
  },

  methods: {
    execute: function () {
      if (this.flow) return this.runOperation(this.flow.executar());
      if (!this.running) this.$emit('onExecute', this.steps[this.current]);
    },
    runOperation: function (task) {
      var vm = this;
      return task.catch(function (error) { vm.$setState({ error: error.message }); vm.$emit('onError', error); });
    },
    chooseOption: function (task, option) { this.flow.TAREFA_SELECTED = task; return this.runOperation(this.flow[option]()); },
    authenticate: function () { return this.runOperation(this.flow.validarUsuario()); },
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
