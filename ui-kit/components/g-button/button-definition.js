import template from './g-button.html';
import styles from './g-button.css';
export function buttonDefinition(defaults = {}) {
  return {
    props: {
      text: EasyComponents.text(defaults.text || ''), color: EasyComponents.text(defaults.color || 'primary'),
      variant: EasyComponents.text('solid'), size: EasyComponents.text('md'), shape: EasyComponents.text('rounded'),
      icon: EasyComponents.text(defaults.icon || ''), textLoading: EasyComponents.text(defaults.textLoading || 'Carregando...'),
      isDisabled: EasyComponents.boolean(false), loading: EasyComponents.boolean(false), block: EasyComponents.boolean(false),
      type: EasyComponents.text('button'), customClass: EasyComponents.text(''), ariaLabel: EasyComponents.text(''), onClick: EasyComponents.event()
    },
    methods: { click: function (event) { if (!this.isDisabled && !this.loading) this.$emit('onClick', event); } },
    template, styles, scoped: true
  };
}
