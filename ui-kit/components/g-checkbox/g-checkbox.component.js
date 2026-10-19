import template from './g-checkbox.html';
import styles from './g-checkbox.css';
export default EasyComponents.defineComponent('g-checkbox', {
  props: { model: EasyComponents.boolean(false), label: EasyComponents.text(''), description: EasyComponents.text(''), isDisabled: EasyComponents.boolean(false), indeterminate: EasyComponents.boolean(false), required: EasyComponents.boolean(false), onChange: EasyComponents.event() },
  methods: { change: function (event) { if (!this.isDisabled) this.$emit('onChange', event.target.checked); }, sync: function () { const input = this.$element[0].querySelector('input'); if (input) input.indeterminate = this.indeterminate; } },
  hooks: { postLink: function () { this.sync(); }, onChanges: function () { this.sync(); } }, template, styles, scoped: true
});
